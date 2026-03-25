import { HttpStatus } from '../utils/httpstatus';

export class ErrorInfo {
    public message: string;
    public code: number;
    public details?: any;

    constructor(message: string, code: number = HttpStatus.INTERNAL_SERVER_ERROR, details?: any) {
        this.message = message;
        this.code = code;
        this.details = details;
    }
}

export class Result<T> {
    public success: boolean;
    public data: T | null;
    public error: ErrorInfo | null;
    public timestamp: string;

    private constructor(success: boolean, data: T | null, error: ErrorInfo | null) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }

    public static success<T>(data: T): Result<T> {
        return new Result<T>(true, data, null);
    }

    public static failure<T>(message: string, code: number = HttpStatus.INTERNAL_SERVER_ERROR, details?: any): Result<T> {
        return new Result<T>(false, null, new ErrorInfo(message, code, details));
    }
}
