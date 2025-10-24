export type DealStatus =
    | 'PENDING' 
    | 'ACTIVE' 
    | 'PENDING_REVIEW' 
    | 'DISPUTED' 
    | 'COMPLETED' 
    | 'CANCELLED' 

export type DealPlatform = 'Instagram' | 'YouTube' | 'TikTok';

export interface MintIDRXRequest {
    amount: number; 
}

export interface MintResponse {
    data: {
        status: "MINTED_SUCCESS" | "";
        transaction_hash: string;
    }
}

export interface TransactionResponse {
    tx_hash: string;
    status: DealStatus;
}
export interface CreateDealApiSuccessResponse extends TransactionResponse {
    deal_id: string;
}

export interface FundingInitiationResponse {
    deal_id: string;
    totalDeposit: number;
    paymentLinkUrl: string;
}


export interface CreateDealFormInput {
    creatorEmail: string;
    amount: string; 
    platform: DealPlatform;
    deliverable: string;
    deadline: string; 
}

export interface CreateDealPayload {
    email: string; 
    amount: number; 
    deadline: number; 
    brief_hash: string; 
}

export interface FundDealPayload {
    deal_id: string;
    amount: number;
}

export interface SubmitContentPayload {
    deal_id: string;
    content_url: string;
}

export interface InitiateDisputePayload {
    deal_id: string;
    reason: string;
}

export interface ResolveDisputePayload {
    deal_id: string;
    is_accept_dispute: boolean;
}

export interface UploadBriefResponse {
    upload_url: string; 
    file_url: string; 
}

export interface TransactionResponse {
    transaction_hash: string; 
    status: DealStatus; 
}

export interface CreateDealApiSuccessResponse extends TransactionResponse {
    data: {
        deal_id: string;
        transaction_hash: string;
    }
    totalDeposit: number
}

export interface FundingInitiationResponse {
    deal_id: string;
    totalDeposit: number; 
    paymentLinkUrl: string; 
}

export interface DealResponse {
    deal_id: string;
    brand: string; 
    creator: string; 
    amount: number; 

    deadline: number; 
    status: DealStatus;
    brief_hash: string;
    accepted_dispute: boolean | null;
    dispute_reason: string | null;

    content_url: string | null;
    review_deadline: number | null; 
    funded_at: number | null; 
    submitted_at: number | null; 
    disputed_at: number | null;
}