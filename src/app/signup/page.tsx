import { redirect } from 'next/navigation'

export default function SignupRedirect() {
  redirect('/v3/signup')
}
