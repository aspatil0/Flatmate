import { Request, Response } from 'express';
export declare const startConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getConversations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getConversationMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const sendMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=chatController.d.ts.map