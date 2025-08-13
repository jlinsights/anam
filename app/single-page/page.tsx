import { redirect } from 'next/navigation'

export default async function SinglePageHome() {
  // Redirect to main gallery page which is working correctly
  redirect('/')
}