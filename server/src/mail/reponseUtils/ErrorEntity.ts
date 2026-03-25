export class ErrorEntity extends Error {
    public http_code: number;
    public error: string;
    public error_description: string;

    constructor(data: { http_code: number; error: string; error_description: string }) {
        super(data.error_description);
        this.http_code = data.http_code;
        this.error = data.error;
        this.error_description = data.error_description;
    }
}
