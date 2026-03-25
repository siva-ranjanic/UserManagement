export interface EmailConfig {
    provider?: string;
    host_name: string;
    host_port?: number;
    client_id?: string;
    client_secret?: string;
    from?: string;
}

export interface CommonEmailSendEntity {
    email_config: EmailConfig;
    from?: string;
    from_name?: string;
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: any[];
    reply_to?: string;
}
