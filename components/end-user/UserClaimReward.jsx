import React, { useEffect, useState, useContext } from "react";

import { Web3Context } from "@context/Web3Context";
import s from "/sass/claim/claim.module.css";

import {
    withClaimableRewardQuery,
    withClaimRewardSubmit,
    isSubmittingReward,
    isFetchingReward,
} from "shared/HOC/reward";

const UserClaimReward = ({ session, reward, onSubmitReward }) => {
    const [error, setError] = useState(null);
    const [showTask, setShowTask] = useState(true);
    const { SignOut } = useContext(Web3Context);

    useEffect(async () => {
        if (session && reward?.isError) {
            setError(reward?.message);
        }
    }, [reward]);

    const onClaim = async () => {
        await onSubmitReward(reward.pendingReward);
    };

    const onSkip = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setShowTask(false);
    };
    return (
        <div className={s.board}>
            <div className={s.board_container}>
                <div className={s.board_wrapper}>
                    <div className={s.board_content}>
                        {error && (
                            <>
                                <div className={`${s.board_title} `}>Something is not right...</div>
                                <div className={`${s.board_text} `}>{error}</div>
                            </>
                        )}
                        {reward?.pendingReward && !error && (
                            <>
                                {(isSubmittingReward || isFetchingReward) && (
                                    <div className={s.board_loading}>
                                        <img
                                            src="/img/sharing-ui/clamsparkle.gif"
                                            alt="Loading data"
                                        />
                                        {/* <div>Fetching data...</div> */}
                                    </div>
                                )}
                                <div className={s.board_title}>
                                    You won {reward?.pendingReward.rewardTypeId}{" "}
                                    {reward?.pendingReward.rewardType.reward}
                                </div>

                                <button
                                    className={s.board_pinkBtn}
                                    onClick={onClaim}
                                    disabled={
                                        reward?.pendingReward?.isClaimed ||
                                        isSubmittingReward ||
                                        isFetchingReward
                                    }
                                >
                                    <img
                                        src={
                                            !reward?.pendingReward?.isClaimed
                                                ? "/img/sharing-ui/invite/pink_button.png"
                                                : "/img/sharing-ui/invite/disconnect.png"
                                        }
                                        alt="connectToContinue"
                                    />
                                    <div>
                                        <span>
                                            {!reward?.pendingReward?.isClaimed
                                                ? "Claim"
                                                : "Already Claimed"}
                                        </span>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className={s.board_disconnect}>
                    {!isSubmittingReward && !isFetchingReward && (
                        <button onClick={() => SignOut()}>Disconnect</button>
                    )}
                </div>
            </div>
        </div>
    );
};
const SubmitReward = withClaimRewardSubmit(UserClaimReward);
export default withClaimableRewardQuery(SubmitReward);
