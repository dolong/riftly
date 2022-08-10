import { getSession } from "next-auth/react";
import { isWhiteListUser } from "repositories/session-auth";

const whitelistUserMiddleware = (handler) => {
    return async (req, res) => {

        const session = await getSession({ req });
        if (!session) {
            return res.status(200).json({
                message: "Missing session auth",
                isError: true,
            });
        }
        let whiteListUser = await isWhiteListUser(session);
        if (!whiteListUser) {
            return res.status(200).json({
                message: "Not authenticated for user route",
                isError: true,
            });
        }

        req.whiteListUser = whiteListUser;
        return handler(req, res);
    };
};

export default whitelistUserMiddleware;
