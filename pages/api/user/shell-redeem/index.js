import { prisma } from "context/PrismaContext";
import whitelistUserMiddleware from "middlewares/whitelistUserMiddleware";
import Enums from "enums";
import { ipRateLimit } from 'lib/ip-rate-limit'

export const config = {
    runtime: 'experimental-edge',
}

const shellRedeemQueryAPI = async (req, res) => {
    const { method } = req;

    // if (process.env.NODE_ENV === 'production') {
    //     console.log("In production, throttle the request")
    //     const checkLimit = await ipRateLimit(req)

    //     // If the status is not 200 then it has been rate limited.
    //     if (checkLimit?.status !== 200) {
    //         return res.status(500).json({ error: checkLimit.statusText })
    //     }
    //     await sleep()
    // }

    if (method !== 'GET') {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    try {
        // let wallet = utils.getAddress(whiteListUser.wallet);
        const whiteListUser = req.whiteListUser;
        console.log(`** Get shell redeem for user **`);

        let userShellRedeem = await prisma.shellRedeemed.findUnique({
            where: { wallet: whiteListUser.wallet }
        })

        //return nothing if not found any, shell not created yet
        if (!userShellRedeem) {
            // return new Response(JSON.stringify({ success: true }), {
            //     status: 200,
            //     headers: res.headers,
            // })
            return res.status(200).json(userShellRedeem);
        } else {
            // if is Redeemed then return rewards array
            if (userShellRedeem.isRedeemed) {
                // let correctRewards = []
                // for (let i = 0; i <= userShellRedeem.rewardPointer; i++) {
                //     let currentReward = userShellRedeem.rewards[i]

                //     correctRewards.push[currentReward];
                // }

                // userShellRedeem.rewards = []
                userShellRedeem.rewards = userShellRedeem.rewards.splice(0, userShellRedeem.rewardPointer + 1)

                // console.log(correctRewards)
                console.log(userShellRedeem)
                return res.status(200).json(userShellRedeem);
                // return new Response(JSON.stringify({ success: true }), {
                //     status: 200,
                //     headers: res.headers,
                // })
            }
            // else not redeemed,
            else {
                return res.status(200).json({ isRedeemed: false });
                // return new Response(JSON.stringify({ success: true }), {
                //     status: 200,
                //     headers: res.headers,
                // })
            }
        }
        // res.status(200).json({ message: "ok" });
    } catch (err) {
        // console.log(err);
        // return new Response(JSON.stringify({ error: true }), {
        //     status: 500,
        //     headers: res.headers,
        // })
        res.status(500).json({ error: err.message });
    }

};
export default whitelistUserMiddleware(shellRedeemQueryAPI);
//export default (shellRedeemQueryAPI);