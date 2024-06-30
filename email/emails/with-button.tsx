import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export default function WithButton({
  preview,
  heading,
  button,
  href,
  text,
}: {
  preview: string;
  heading: string;
  button: string;
  href: string;
  text: string;
}) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              primary: "#2b4872",
              muted: "#a3a3a3",
            },
          },
        },
      }}
    >
      <Html>
        <Head>
          <Font
            fontFamily="Geist"
            fallbackFontFamily="Arial"
            webFont={{
              url: "https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-sans/Geist-Variable.woff2",
              format: "woff2",
            }}
          />
        </Head>
        <Preview>{preview}</Preview>
        <Body>
          <Container>
            <Img
              src="https://i.imgur.com/0JgWeqZ.png"
              width={40}
              height={40}
              draggable={false}
              alt="Saund Icon"
            />
            <Heading as="h1">{heading}</Heading>

            <Section className="my-6">
              <Button
                className="bg-primary p-3 text-white rounded-2xl"
                href={href}
              >
                {button}
              </Button>
              <Text className="text-base">{text}</Text>
            </Section>

            <Text className="text-base">
              <br />- Saund Team
            </Text>

            <Hr className="border-b-muted" />

            <Text className="text-muted text-sm">
              &copy; Saund 2024. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
