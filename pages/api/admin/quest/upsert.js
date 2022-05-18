import { prisma } from "context/PrismaContext";
import Enums from "enums";
import { questUpsert } from "repositories/quest";
import adminMiddleware from "middlewares/adminMiddleware";

const ROUTE = "/api/admin/quest/upsert";
const AdminQuestUpsertAPI = async (req, res) => {
    const { method } = req;

    switch (method) {
        /*  
            @dev Create a new quest for user
        */
        case "POST":
            try {
                const {
                    id,
                    type,
                    description,
                    text,
                    completedText,
                    rewardTypeId,
                    quantity,
                    isEnabled,
                    isRequired,
                    extendedQuestData,
                } = req.body;

                // look for quest type id of this type
                let questType = await prisma.questType.findUnique({
                    where: {
                        name: type,
                    },
                });

                if (!questType) {
                    return res
                        .status(200)
                        .json({ isError: true, message: `Cannot find quest type ${type}` });
                }
                let newExtendedQuestData;
                if (id === 0) {
                    newExtendedQuestData = { ...extendedQuestData };

                    let existingQuests = await prisma.quest.findMany({
                        include: {
                            type: true,
                        },
                    });

                    let existingDiscordTwitterAuth = discordTwitterAuthCheck(
                        existingQuests,
                        questType.name
                    );
                    if (existingDiscordTwitterAuth) {
                        return res.status(200).json({
                            message: `Cannot add more than one "${type}" type for same auth `,
                            isError: true,
                        });
                    }

                    let existingJoinDiscord = joinDiscordCheck(existingQuests, questType.name);
                    if (existingJoinDiscord) {
                        return res.status(200).json({
                            message: `Cannot add more than one "${type}" type`,
                            isError: true,
                        });
                    }

                    let existingTwitterRetweet = retweetCheck(
                        existingQuests,
                        extendedQuestData,
                        questType.name
                    );
                    if (existingTwitterRetweet) {
                        return res.status(200).json({
                            message: `Cannot add more than one "${type}" type for same tweetId "${extendedQuestData.tweetId}"`,
                            isError: true,
                        });
                    }

                    let existingFollowTwitter = followTwitterCheck(
                        existingQuests,
                        extendedQuestData,
                        questType.name
                    );
                    if (existingFollowTwitter) {
                        return res.status(200).json({
                            message: `Cannot add more than one "${type}" type for same twitter "${extendedQuestData.followAccount}".`,
                            isError: true,
                        });
                    }

                    let existingFollowInstagram = followInstagramCheck(
                        existingQuests,
                        extendedQuestData,
                        questType.name
                    );
                    if (existingFollowInstagram) {
                        return res.status(200).json({
                            message: `Cannot add more than one "${type}" type for same instagram "${extendedQuestData.followAccount}".`,
                            isError: true,
                        });
                    }

                    let existingNoodsClaim = noodsClaimCheck(existingQuests, questType.name);
                    if (existingNoodsClaim) {
                        return res.status(200).json({
                            message: `Cannot add more than one "${type}" type to quest list `,
                            isError: true,
                        });
                    }

                    let existingZEDClaim = ZEDClaimCheck(existingQuests, questType.name);
                    if (existingZEDClaim) {
                        return res.status(200).json({
                            message: `Cannot add more than one "${type}" type to quest list `,
                            isError: true,
                        });
                    }
                    // TODO: ANOMURA_SUBMISSION_QUEST CHECK  add guard for app submission app request
                } else {
                    // update, we need to get original extendedQuestData and create a new object to avoid data loss
                    let originalQuest = await prisma.quest.findUnique({
                        where: { id },
                    });

                    if (originalQuest) {
                        newExtendedQuestData = {
                            ...originalQuest.extendedQuestData,
                            ...extendedQuestData,
                        };
                    }
                }

                console.log(`** Upsert a quest **`);
                let newQuest = await questUpsert(
                    id,
                    questType.id,
                    description,
                    text,
                    completedText,
                    rewardTypeId,
                    quantity,
                    isEnabled,
                    isRequired,
                    newExtendedQuestData
                );

                if (!newQuest) {
                    res.status(200).json({
                        isError: true,
                        message: `Cannot upsert quest ${id}, type ${type}`,
                    });
                }

                res.status(200).json(newQuest);
            } catch (err) {
                console.log(err);
                res.status(500).json({ err });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
};

// DISCORD_AUTH: "Discord Authenticate",
// TWITTER_AUTH: "Twitter Authenticate",
// TWITTER_RETWEET: "Retweet a Tweet",
// FOLLOW_TWITTER: "Follow Twitter Account",
// FOLLOW_INSTAGRAM: "Follow Instagram Account",
// ANOMURA_SUBMISSION_QUEST: "Anomura #SUBMISSION Quest",

const discordTwitterAuthCheck = (existingQuests, type) => {
    if (type != Enums.DISCORD_AUTH && type != Enums.TWITTER_AUTH) return;

    let discordAuthQuest = existingQuests.filter((q) => q.type.name === Enums.DISCORD_AUTH);
    let twitterAuthQuest = existingQuests.filter((q) => q.type.name === Enums.TWITTER_AUTH);

    if (
        (discordAuthQuest?.length >= 1 && type === Enums.DISCORD_AUTH) ||
        (twitterAuthQuest?.length >= 1 && type === Enums.TWITTER_AUTH)
    ) {
        return true;
    }
    return false;
};

const joinDiscordCheck = (existingQuests, type) => {
    if (type != Enums.JOIN_DISCORD) return;

    let joinDiscordQuest = existingQuests.filter((q) => q.type.name === Enums.JOIN_DISCORD);

    if (joinDiscordQuest?.length >= 1 && type === Enums.JOIN_DISCORD) {
        return true;
    }
    return false;
};

const followTwitterCheck = (existingQuests, extendedQuestData, type) => {
    if (type !== Enums.FOLLOW_TWITTER) return;
    let followTwitterQuest = existingQuests.filter((q) => q.type.name === Enums.FOLLOW_TWITTER);

    return followTwitterQuest.some(
        (q) => q.extendedQuestData.followAccount === extendedQuestData.followAccount
    );
};

const followInstagramCheck = (existingQuests, extendedQuestData, type) => {
    if (type !== Enums.FOLLOW_INSTAGRAM) return;

    let followInstagramQuest = existingQuests.filter((q) => q.type.name === Enums.FOLLOW_INSTAGRAM);

    return followInstagramQuest.some(
        (q) => q.extendedQuestData.followAccount === extendedQuestData.followAccount
    );
};

const retweetCheck = (existingQuests, extendedQuestData, type) => {
    if (type !== Enums.TWITTER_RETWEET) return;
    let twitterRetweetQuest = existingQuests.filter((q) => q.type.name === Enums.TWITTER_RETWEET);

    return twitterRetweetQuest.some(
        (q) => q.extendedQuestData.tweetId === extendedQuestData.tweetId
    );
};

const noodsClaimCheck = (existingQuests, type) => {
    if (type != Enums.NOODS_CLAIM) return;

    let noodsQuest = existingQuests.filter((q) => q.type.name === Enums.NOODS_CLAIM);

    if (noodsQuest?.length >= 1 && type === Enums.NOODS_CLAIM) {
        return true;
    }
    return false;
};
const ZEDClaimCheck = (existingQuests, type) => {
    if (type != Enums.ZED_CLAIM) return;

    let zedQuest = existingQuests.filter((q) => q.type.name === Enums.ZED_CLAIM);

    if (zedQuest?.length >= 1 && type === Enums.ZED_CLAIM) {
        return true;
    }
    return false;
};

export default adminMiddleware(AdminQuestUpsertAPI);
