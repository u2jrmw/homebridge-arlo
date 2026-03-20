export interface arloOptionsInterface {
  arloPassword: string;
  arloUser: string;
  debug: boolean;
  emailImapPort: number;
  emailPassword: string;
  emailServer: string;
  emailUser: string;
  enableRetry: boolean;
  retryInterval: number;
  /** When set, this OTP is used instead of IMAP. emailUser is still required to match the email MFA factor. */
  mfaCode?: string;
}

export type arloOptions = Readonly<arloOptionsInterface>;
