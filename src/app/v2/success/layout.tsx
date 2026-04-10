export const metadata = {
  title: 'Welcome to Dealsletter Pro',
  description: 'Your subscription is now active.'
}

export default function Layout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
