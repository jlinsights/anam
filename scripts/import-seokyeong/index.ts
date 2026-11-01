/**
 * 書境 2026(제7회 개인전 「내 마음에 심은 소나무」) 출품작 54점을 갤러리에 넣는다.
 * 작품 정보: scripts/data/seokyeong-2026.json (협회 Airtable app98CHubRtFuE68t 에서 작품 칸만 옮김)
 *
 * 순서가 중요하다 — 행을 먼저 넣으면 운영 갤러리에 이미지 없는 칸이 생긴다.
 *   1. images: 원본(첨부 id 이름의 jpg)이 든 폴더에서 full·preview 를 만들고 크기 목록에 더한다
 *        npx tsx scripts/import-seokyeong images <원본 폴더>
 *      → 커밋·머지·배포
 *   2. rows: 배포된 뒤 Supabase artworks 에 슬러그 기준으로 upsert (SUPABASE_SERVICE_ROLE_KEY 필요)
 *        npx tsx scripts/import-seokyeong rows
 *      또는 sql: 같은 행을 SQL 로 출력(검토·수동 실행용)
 *        npx tsx scripts/import-seokyeong sql
 *   3. /api/revalidate 또는 /api/admin/sync 로 캐시를 비운다
 *
 * 원본은 저장소에 넣지 않는다(장당 5MB 안팎). 다시 만들 때는 협회 Airtable 첨부에서 받는다.
 * ANAM 자체 Airtable 이 같은 슬러그(anam-62~)를 쓰게 되면 migrate-airtable-to-supabase 가 이 행을 덮어쓴다.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { config } from 'dotenv'
import data from '../data/seokyeong-2026.json'
import { toArtworkRow, type SeokyeongWork } from './rows'

config({ path: path.resolve(process.cwd(), '.env.local') })

const root = process.cwd()
const optimizedDir = path.join(root, 'public/Images/Artworks/optimized')
const manifestPath = path.join(root, 'lib/artwork-full-sizes.json')
const works = data.works as SeokyeongWork[]
const LONG_EDGE = 1800
const PREVIEW_LONG_EDGE = 800
// 여러 폭(병풍·연작)을 한 장으로 이을 때 폭 사이 간격과 바탕(종이색, 흰색)
const PANEL_GAP_RATIO = 0.02
const PAPER = { r: 255, g: 255, b: 255 }

const readManifest = (): Record<string, number[]> =>
  JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

// 여러 폭을 같은 높이로 맞춰 왼쪽부터 나란히 잇는다
async function composePanels(files: string[]): Promise<Buffer> {
  const metas = await Promise.all(
    files.map((f) => sharp(f).rotate().metadata())
  )
  const height = Math.min(...metas.map((m) => m.height ?? 0))
  const resized = await Promise.all(
    files.map((f) =>
      sharp(f)
        .rotate()
        .resize({ height })
        .toColourspace('srgb')
        .toBuffer({ resolveWithObject: true })
    )
  )
  const gap = Math.round(height * PANEL_GAP_RATIO)
  const width =
    resized.reduce((sum, r) => sum + r.info.width, 0) + gap * (files.length - 1)
  let left = 0
  const composite = resized.map((r) => {
    const item = { input: r.data, left, top: 0 }
    left += r.info.width + gap
    return item
  })
  return sharp({ create: { width, height, channels: 3, background: PAPER } })
    .composite(composite)
    .jpeg({ quality: 95 })
    .toBuffer()
}

async function buildImages(sourceDir: string) {
  const manifest = readManifest()
  for (const work of works) {
    const files = work.panels.map((id) => path.join(sourceDir, `${id}.jpg`))
    const missing = files.filter((f) => !fs.existsSync(f))
    if (missing.length > 0)
      throw new Error(`${work.slug} 원본 없음: ${missing.join(', ')}`)

    const input = files.length > 1 ? await composePanels(files) : files[0]
    const key = String(work.number)
    const outDir = path.join(optimizedDir, key)
    fs.mkdirSync(outDir, { recursive: true })

    const full = await sharp(input)
      .rotate()
      .resize(LONG_EDGE, LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
      .toColourspace('srgb')
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(path.join(outDir, `${key}-full.jpg`))
    await sharp(input)
      .rotate()
      .resize(PREVIEW_LONG_EDGE, PREVIEW_LONG_EDGE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toColourspace('srgb')
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(outDir, `${key}-preview.jpg`))

    manifest[key] = [full.width, full.height]
    console.log(
      `${key}  ${full.width}×${full.height}  ${work.title}${files.length > 1 ? ` (${files.length}폭)` : ''}`
    )
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log(
    `\n${works.length}점 생성, 크기 목록: ${path.relative(root, manifestPath)}`
  )
}

const rowsFromManifest = () =>
  works.map((w) => toArtworkRow(w, data.exhibition, readManifest()))

const sqlLiteral = (value: unknown): string => {
  if (value === null) return 'null'
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  if (Array.isArray(value))
    return value.length === 0
      ? "'{}'::text[]"
      : `array[${value.map(sqlLiteral).join(',')}]`
  return `'${String(value).replace(/'/g, "''")}'`
}

function printSql() {
  const rows = rowsFromManifest()
  const columns = Object.keys(rows[0])
  const values = rows.map(
    (row) =>
      `(${columns.map((c) => sqlLiteral(row[c as keyof typeof row])).join(', ')})`
  )
  const updates = columns
    .filter((c) => c !== 'slug')
    .map((c) => `${c} = excluded.${c}`)
  console.log(
    `insert into artworks (${columns.join(', ')}) values\n${values.join(',\n')}\non conflict (slug) do update set ${updates.join(', ')}, updated_at = now();`
  )
}

async function upsertRows() {
  const { createSupabaseAdminClient } =
    await import('../../lib/supabase/server')
  const supabase = createSupabaseAdminClient()
  if (!supabase) throw new Error('SUPABASE_SERVICE_ROLE_KEY 가 없습니다')
  const { error } = await supabase
    .from('artworks')
    .upsert(rowsFromManifest(), { onConflict: 'slug' })
  if (error) throw error
  console.log(
    `${works.length}점 upsert 완료. 캐시를 비우세요(/api/revalidate).`
  )
}

const [mode, arg] = process.argv.slice(2)
const run =
  mode === 'images' && arg
    ? () => buildImages(path.resolve(arg))
    : mode === 'rows'
      ? upsertRows
      : mode === 'sql'
        ? async () => printSql()
        : null

if (!run) {
  console.error(
    '사용: npx tsx scripts/import-seokyeong <images 원본폴더 | rows | sql>'
  )
  process.exit(1)
}
run().catch((error) => {
  console.error(error)
  process.exit(1)
})
