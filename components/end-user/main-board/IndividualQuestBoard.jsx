import React, { useEffect, useState, useRef, useCallback } from "react";
import s from "/sass/claim/claim.module.css";
import Enums from "enums";
import { withUserQuestQuery, withUserQuestSubmit } from "shared/HOC/quest";
import { useRouter } from "next/router";
import { BoardLargeDollarSign } from "..";

import { useToast } from "@chakra-ui/react";
import { BoardTitle, DisconnectButton, ScrollableContent } from "../shared";
import { doQuestUtility } from "../shared/doQuestUtility";

const IndividualQuestBoard = ({
    session,
    isFetchingUserQuests,
    isFetchingUserRewards,
    userQuests,
    queryError,
    onSubmit,
    isSubmitting,
    submittedQuest,
}) => {
    const [currentQuests, setCurrentQuests] = useState([]);
    let router = useRouter();
    const toast = useToast();

    useEffect(() => {
        if (submittedQuest?.isError) {
            toast({
                title: "Exception",
                description: `Catch error at questId: ${submittedQuest.questId}. Please contact admin.`,
                position: "top-right",
                status: "error",
                duration: 10000,
                isClosable: true,
            });
        }
    }, [submittedQuest]);

    useEffect(async () => {
        handleRenderUserQuest();
    }, [userQuests]);

    /* @dev exclude Code Quest, Image Upload, Collaboration Quest, Some other quests related to Twitter
     */
    const handleRenderUserQuest = useCallback(async () => {
        if (userQuests && userQuests.length > 0) {
            let twitterAuthQuest = userQuests.find((q) => q.type.name === Enums.TWITTER_AUTH);
            // check if user has authenticated twitter, to show twitter related quests
            userQuests = userQuests.filter((q) => {
                if (
                    !twitterAuthQuest.isDone &&
                    (q.type.name === Enums.TWITTER_RETWEET || q.type.name === Enums.FOLLOW_TWITTER)
                ) {
                    return false;
                }

                return true;
            });

            userQuests.sort(isAlphabeticallly);
            userQuests.sort(isNotDoneFirst);
            setCurrentQuests(userQuests);
        }
    }, [userQuests]);

    const doQuest = useCallback(
        async (quest) => {
            await doQuestUtility(router, quest, currentQuests, onSubmit);
        },
        [currentQuests]
    );

    return (
        <div className={s.boardLarge}>
            <div className={s.boardLarge_container}>
                <BoardLargeDollarSign session={session} />
                <div className={s.boardLarge_wrapper}>
                    <div className={s.boardLarge_content}>
                        <BoardTitle session={session} />
                        {/*  Render error message */}
                        {currentQuests?.isError && <div>{currentQuests?.message}</div>}

                        <ScrollableContent
                            isFetchingUserQuests={isFetchingUserQuests}
                            isSubmitting={isSubmitting}
                            isFetchingUserRewards={isFetchingUserRewards}
                            currentQuests={currentQuests}
                            doQuest={(item) => doQuest(item)}
                        />
                    </div>
                </div>
            </div>
            {!isFetchingUserQuests && <DisconnectButton />}
        </div>
    );
};

function isNotDoneFirst(a, b) {
    return Number(a.isDone) - Number(b.isDone);
}
function isAlphabeticallly(a, b) {
    return a.text.localeCompare(b.text);
}

const firstHOC = withUserQuestSubmit(IndividualQuestBoard);
export default withUserQuestQuery(firstHOC);
