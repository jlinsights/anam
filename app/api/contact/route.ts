import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 문의 폼 데이터 스키마
const contactSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  phone: z.string().optional(),
  subject: z.string().min(1, '제목을 입력해주세요'),
  message: z.string().min(1, '문의 내용을 입력해주세요'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 입력 데이터 검증
    const validatedData = contactSchema.parse(body)

    // 이메일 전송 로직 (Nodemailer 사용)
    const nodemailer = require('nodemailer')

    // SMTP 설정 (환경변수 사용)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // 이메일 내용 구성
    const mailOptions = {
      from: `"아남 갤러리 문의" <${process.env.SMTP_USER}>`,
      to: 'heelang@orientalcalligraphy.org',
      subject: `[아남 갤러리 문의] ${validatedData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            아남 갤러리 문의
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">문의자 정보</h3>
            <p><strong>이름:</strong> ${validatedData.name}</p>
            <p><strong>이메일:</strong> ${validatedData.email}</p>
            ${
              validatedData.phone
                ? `<p><strong>전화번호:</strong> ${validatedData.phone}</p>`
                : ''
            }
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #495057; margin-top: 0;">문의 내용</h3>
            <p><strong>제목:</strong> ${validatedData.subject}</p>
            <div style="margin-top: 15px;">
              <strong>내용:</strong>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">
                ${validatedData.message}
              </div>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
            <p>이 메시지는 아남 갤러리 웹사이트의 문의 폼을 통해 전송되었습니다.</p>
            <p>전송 시간: ${new Date().toLocaleString('ko-KR', {
              timeZone: 'Asia/Seoul',
            })}</p>
          </div>
        </div>
      `,
    }

    // 이메일 전송
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: '문의가 성공적으로 전송되었습니다.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
