import { redirect } from 'next/navigation'

export default function LoginRedirect() {
  redirect('/v3/login')
}
