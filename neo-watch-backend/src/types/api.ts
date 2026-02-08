/**
 * API Response Type Definitions
 */

// {{{ Generic API Response
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}
// }}}

// {{{ Paginated Response
export interface PaginatedResponse<T> {
	success: boolean;
	data: T[];
	pagination: {
		page: number;
		size: number;
		totalItems: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
}
// }}}

// {{{ Error Response
export interface ErrorResponse {
	success: false;
	error: string;
	code?: string;
	details?: Record<string, unknown>;
}
// }}}
