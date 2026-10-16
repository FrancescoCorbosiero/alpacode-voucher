/* ============================================================
   Email via AWS SES — the same setup as alpacode.it's contact form
   (same env vars, same "no AWS_REGION = log and succeed" dev mode,
   same greppable failure hints).
   ============================================================ */
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { business } from "../../data/business";
import { readEnv } from "./env";

let client: SESv2Client | null = null;
const ses = (region: string) => (client ??= new SESv2Client({ region }));

const SES_HINTS: Record<string, string> = {
  CredentialsProviderError:
    "no AWS credentials reached the container: set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, then `docker compose up -d`",
  UnrecognizedClientException: "AWS_ACCESS_KEY_ID is not an active IAM access key",
  InvalidClientTokenId: "AWS_ACCESS_KEY_ID is not an active IAM access key",
  InvalidSignatureException:
    "AWS_SECRET_ACCESS_KEY doesn't match the key id (an SES SMTP password is not a secret access key)",
  SignatureDoesNotMatch:
    "AWS_SECRET_ACCESS_KEY doesn't match the key id (an SES SMTP password is not a secret access key)",
  AccessDeniedException: "the IAM user's policy must allow ses:SendEmail",
  MessageRejected:
    "the identity isn't verified in this region: check AWS_REGION and the domain's DKIM records (in the SES sandbox the recipient must be verified too)",
};

function describe(err: unknown): string {
  const e = (err ?? {}) as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
  const name = e.name ?? "Error";
  const status = e.$metadata?.httpStatusCode;
  const hint = SES_HINTS[name];
  return `${name}${status ? ` (HTTP ${status})` : ""}: ${e.message ?? String(err)}${hint ? ` → ${hint}` : ""}`;
}

export interface Mail {
  subject: string;
  text: string;
  /** Defaults to CONTACT_TO_EMAIL (the studio inbox). */
  to?: string;
  replyTo?: string;
}

/** "sent" | "logged" (dev, no SES) | "failed" (logged with the fix). */
export async function sendMail(mail: Mail): Promise<"sent" | "logged" | "failed"> {
  const region = readEnv("AWS_REGION") ?? readEnv("AWS_DEFAULT_REGION");
  const to = mail.to ?? readEnv("CONTACT_TO_EMAIL") ?? business.email;
  const from = readEnv("CONTACT_FROM_EMAIL") ?? business.email;

  if (!region) {
    console.info(`[referral] (no AWS_REGION — not sent via SES) to ${to}\n${mail.subject}\n${mail.text}`);
    return "logged";
  }
  try {
    await ses(region).send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: [to] },
        ReplyToAddresses: mail.replyTo ? [mail.replyTo] : undefined,
        Content: {
          Simple: {
            Subject: { Data: mail.subject, Charset: "UTF-8" },
            Body: { Text: { Data: mail.text, Charset: "UTF-8" } },
          },
        },
      }),
    );
    return "sent";
  } catch (err) {
    console.error(`[referral] SES send failed (region ${region}, from ${from}, to ${to}): ${describe(err)}`);
    console.error(`[referral] undelivered message:\n${mail.subject}\n${mail.text}`);
    return "failed";
  }
}
