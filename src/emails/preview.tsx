import { render } from '@react-email/components'
import IssueTemplate from './templates/IssueTemplate'
import { getLatestIssue } from '@/data/deal-breakdown-issues'

const issue = getLatestIssue()
if (!issue) {
  console.error('No issues found')
  process.exit(1)
}

const html = await render(
  <IssueTemplate issue={issue} />
)

console.log(html)
