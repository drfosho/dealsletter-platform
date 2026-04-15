import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Button,
  Hr,
  Img,
  Preview,
} from '@react-email/components'

export interface FounderSection {
  type: 'text' | 'divider' | 'highlight' | 'stats'
  content?: string
  label?: string
  stats?: Array<{
    value: string
    label: string
  }>
}

interface FounderTemplateProps {
  subject: string
  previewText: string
  greeting?: string
  sections: FounderSection[]
  ctaText?: string
  ctaUrl?: string
  signoff?: string
}

export default function FounderTemplate({
  subject,
  previewText,
  greeting = 'Hey,',
  sections,
  ctaText,
  ctaUrl,
  signoff = 'kdog',
}: FounderTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{
        background: '#f4f4f8',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        margin: 0,
        padding: '40px 0',
      }}>
        <Container style={{
          maxWidth: 560,
          margin: '0 auto',
        }}>

          {/* Header */}
          <Section style={{
            background: '#1a1830',
            borderRadius: '12px 12px 0 0',
            padding: '24px 32px',
          }}>
            <Img
              src="https://xsiflgnnowyvkhxjwmuu.supabase.co/storage/v1/object/public/email-assets/wordmark-transparent.png"
              alt="Dealsletter"
              width={160}
              style={{
                display: 'block',
                width: '160px',
                height: 'auto',
              }}
            />
          </Section>

          {/* Body */}
          <Section style={{
            background: '#ffffff',
            padding: '36px 32px 24px',
          }}>
            {/* Greeting */}
            <Text style={{
              fontSize: 16,
              color: '#1a1830',
              margin: '0 0 24px 0',
              fontWeight: 600,
            }}>
              {greeting}
            </Text>

            {/* Sections */}
            {sections.map((section, i) => {
              if (section.type === 'text') {
                return (
                  <Text
                    key={i}
                    style={{
                      fontSize: 15,
                      color: '#4a4869',
                      lineHeight: 1.8,
                      margin: '0 0 18px 0',
                    }}
                  >
                    {section.content}
                  </Text>
                )
              }

              if (section.type === 'divider') {
                return (
                  <Section key={i} style={{
                    margin: '8px 0 24px 0',
                  }}>
                    <Hr style={{
                      border: 'none',
                      borderTop: '1px solid #eeecff',
                      margin: 0,
                    }} />
                    {section.label && (
                      <Text style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        color: '#6366F1',
                        margin: '16px 0 0 0',
                      }}>
                        {section.label}
                      </Text>
                    )}
                  </Section>
                )
              }

              if (section.type === 'highlight') {
                return (
                  <Section key={i} style={{
                    background: '#f0eeff',
                    border: '1px solid #d4d0ff',
                    borderRadius: 10,
                    padding: '20px 24px',
                    margin: '4px 0 24px 0',
                  }}>
                    {section.label && (
                      <Text style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        color: '#6366F1',
                        margin: '0 0 8px 0',
                      }}>
                        {section.label}
                      </Text>
                    )}
                    <Text style={{
                      fontSize: 15,
                      color: '#2d2b5e',
                      lineHeight: 1.8,
                      margin: 0,
                      fontWeight: 500,
                    }}>
                      {section.content}
                    </Text>
                  </Section>
                )
              }

              if (section.type === 'stats') {
                return (
                  <Section key={i} style={{
                    background: '#fafafa',
                    border: '1px solid #eeecff',
                    borderRadius: 10,
                    padding: '20px 24px',
                    margin: '4px 0 24px 0',
                  }}>
                    <Row>
                      {section.stats?.map((stat, j) => (
                        <Column
                          key={j}
                          style={{
                            textAlign: 'center',
                          }}
                        >
                          <Text style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#1a1830',
                            margin: '0 0 4px 0',
                            letterSpacing: '-0.5px',
                          }}>
                            {stat.value}
                          </Text>
                          <Text style={{
                            fontSize: 11,
                            color: '#9994b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            fontWeight: 600,
                            margin: 0,
                          }}>
                            {stat.label}
                          </Text>
                        </Column>
                      ))}
                    </Row>
                  </Section>
                )
              }

              return null
            })}

            {/* CTA */}
            {ctaText && ctaUrl && (
              <Section style={{
                textAlign: 'left',
                margin: '28px 0',
              }}>
                <Button
                  href={ctaUrl}
                  style={{
                    background: '#6366F1',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '12px 28px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  {ctaText}
                </Button>
              </Section>
            )}

            <Hr style={{
              border: 'none',
              borderTop: '1px solid #eeecff',
              margin: '24px 0',
            }} />

            {/* Signoff */}
            <Text style={{
              fontSize: 15,
              color: '#1a1830',
              margin: '0 0 4px 0',
              fontWeight: 600,
            }}>
              — {signoff}
            </Text>
            <Text style={{
              fontSize: 13,
              color: '#9994b8',
              margin: 0,
            }}>
              Founder, Dealsletter
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{
            background: '#1a1830',
            borderRadius: '0 0 12px 12px',
            padding: '20px 32px',
          }}>
            <Text style={{
              fontSize: 12,
              color: '#6b6690',
              margin: '0 0 12px 0',
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              © 2026 Dealsletter ·
              Not financial advice.
            </Text>
            <Text style={{
              textAlign: 'center',
              margin: 0,
            }}>
              <Link
                href="https://x.com/Dealsletter"
                style={{
                  color: '#9994b8',
                  fontSize: 12,
                  textDecoration: 'none',
                  margin: '0 8px',
                }}
              >
                Follow on X
              </Link>
              <span style={{
                color: '#3a3758',
                fontSize: 12,
              }}>
                {' · '}
              </span>
              <Link
                href="https://dealsletter.io"
                style={{
                  color: '#9994b8',
                  fontSize: 12,
                  textDecoration: 'none',
                  margin: '0 8px',
                }}
              >
                dealsletter.io
              </Link>
              <span style={{
                color: '#3a3758',
                fontSize: 12,
              }}>
                {' · '}
              </span>
              <Link
                href="{{{RESEND_UNSUBSCRIBE_URL}}}"
                style={{
                  color: '#9994b8',
                  fontSize: 12,
                  textDecoration: 'none',
                  margin: '0 8px',
                }}
              >
                Unsubscribe
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
