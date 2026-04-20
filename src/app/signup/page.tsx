import { redirect } from 'next/navigation'

export default function SignupRedirect() {
  redirect('/v2/signup')
}
