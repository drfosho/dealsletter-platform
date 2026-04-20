import { redirect } from 'next/navigation'

export default function LoginRedirect() {
  redirect('/v2/login')
}
