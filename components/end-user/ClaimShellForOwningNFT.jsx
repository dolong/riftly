import React, { useEffect, useState, useContext } from "react";
import { Web3Context } from "@context/Web3Context";
import s from "/sass/claim/claim.module.css";
import axios from "axios";
import { withUserQuestQuery, withUserQuestSubmit } from "shared/HOC/quest";
import Enums from "enums";
import { useRouter } from "next/router";

const CLAIMABLE = 0;
const CLAIMED = 1;
const UNCLAIMABLE = 2;

const ClaimShellForOwningNFT = ({
    session,
    reward,
    onSubmit,
    isSubmitting,
    NFT,
    isFetchingUserQuests,
    userQuests,
    chain,
}) => {
    const [nftQuest, setNftQuest] = useState(null);
    const [error, setError] = useState(null);
    const { SignOut, TryValidate } = useContext(Web3Context);
    const [isMetamaskDisabled, setIsMetamaskDisabled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [isValidating, setIsValidating] = useState(false);
    const [title, setTitle] = useState("Claimable $SHELL for owning NFT");
    const [currentView, setView] = useState(CLAIMABLE);
    let router = useRouter();

    useEffect(() => {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
                navigator.userAgent
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                navigator.userAgent.substr(0, 4)
            )
        ) {
            setIsMobile(true);
        } else {
            setIsMobile(false);
        }
        const ethereum = window.ethereum;
        setIsMetamaskDisabled(!ethereum || !ethereum.on);
    }, []);

    useEffect(async () => {
        if (userQuests) {
            let findNftQuest = userQuests.find((q) => q.type.name === NFT);

            if (findNftQuest) {
                setNftQuest(findNftQuest);
                if (findNftQuest.isDone) {
                    setView(CLAIMED);
                }
            }
        }
    }, [userQuests]);

    const onClaim = async () => {
        setIsValidating(true);
        try {
            if (nftQuest.isDone) {
                setIsValidating(false);
                return;
            }
            let ownerAddress;
            if (!isMetamaskDisabled && !isMobile) {
                ownerAddress = await TryValidate(Enums.METAMASK);
            } else {
                ownerAddress = await TryValidate(Enums.WALLETCONNECT);
            }

            let haveNft = false;

            let allNFTsOwned = await axios.get(
                `https://deep-index.moralis.io/api/v2/${ownerAddress}/nft?chain=${chain}&format=decimal`,
                {
                    headers: {
                        "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_APIKEY,
                    },
                }
            );

            console.log(allNFTsOwned);

            if (allNFTsOwned?.data?.result?.length > 0) {
                let nftsToProcess = allNFTsOwned?.data?.result;

                let promiseCheck = nftsToProcess.map((nft) => {
                    if (nft.symbol === "NOODS" || nft.name === "Human Park") {
                        haveNft = true;
                    }
                    if (nft.symbol === "ZED" || nft.name === "ZED Horse") {
                        haveNft = true;
                    }
                });
                Promise.all(promiseCheck);
                if (!haveNft) {
                    setIsValidating(false);
                    setView(UNCLAIMABLE);
                    return;
                }
            } else {
                setIsValidating(false);
                setView(UNCLAIMABLE);
                return;
            }

            const { questId, type, quantity, rewardTypeId, extendedQuestData } = nftQuest;
            let submission = {
                questId,
                type,
                rewardTypeId,
                quantity,
                extendedQuestData,
            };
            await onSubmit(submission, userQuests);
            setView(CLAIMED);
            setIsValidating(false);
        } catch (e) {
            setIsValidating(false);
            console.log(e.message);
            return;
        }
    };

    const getNFT = () => {
        let pathname = router.pathname;
        const nft = pathname.split("/");
        return nft[1].toString().trim().toUpperCase();
    };

    return (
        <div className={s.board}>
            <div className={s.board_container}>
                <div className={s.board_dollar}>
                    <div className={s.board_dollar_content}>$$$</div>
                </div>
                <div className={s.board_wrapper}>
                    <div className={s.board_content}>
                        {nftQuest && !error && (
                            <>
                                {(isSubmitting || isFetchingUserQuests || isValidating) && (
                                    <div className={s.board_loading}>
                                        <div className={s.board_loading_wrapper}>
                                            <img
                                                src={`${Enums.BASEPATH}/img/sharing-ui/clamsparkle.gif`}
                                                alt="Loading data"
                                            />
                                            <div className={s.board_loading_wrapper_text}>
                                                Loading
                                                <span
                                                    className={
                                                        s.board_loading_wrapper_text_ellipsis
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentView === CLAIMABLE &&
                                    !isSubmitting &&
                                    !isFetchingUserQuests &&
                                    !isValidating && (
                                        <>
                                            <div className={s.board_title}>
                                                {/* Claim $SHELL for owning {getNFT()} */}
                                                {nftQuest.text}
                                            </div>

                                            <button
                                                className={s.board_pinkBtn}
                                                onClick={onClaim}
                                                disabled={
                                                    nftQuest?.isDone ||
                                                    isSubmitting ||
                                                    isFetchingUserQuests
                                                }
                                            >
                                                <img
                                                    src={
                                                        !nftQuest?.isDone
                                                            ? `${Enums.BASEPATH}/img/sharing-ui/invite/Button_Small.png`
                                                            : `${Enums.BASEPATH}/img/sharing-ui/invite/Button_Small 2.png`
                                                    }
                                                    alt="connectToContinue"
                                                />
                                                <div>
                                                    {/* {!nftQuest?.isDone ? "Claim" : "Claimed"} */}
                                                    <span>{nftQuest.quantity}</span>
                                                    {nftQuest.rewardType.reward.match("hell") && (
                                                        <img
                                                            src={`${Enums.BASEPATH}/img/sharing-ui/invite/shell.png`}
                                                            alt="reward icon"
                                                        />
                                                    )}

                                                    {nftQuest.rewardType.reward.match(
                                                        /bowl|Bowl/
                                                    ) && (
                                                        <img
                                                            src={`${Enums.BASEPATH}/img/sharing-ui/invite/bowl10frames.gif`}
                                                            alt="reward icon"
                                                        />
                                                    )}
                                                </div>
                                            </button>
                                        </>
                                    )}
                                {currentView === CLAIMED && (
                                    <>
                                        <div className={s.board_title}>Claimed successfully</div>
                                        <button
                                            className={s.board_pinkBtn}
                                            onClick={() => {
                                                router.push("/");
                                            }}
                                        >
                                            <img
                                                src={`${Enums.BASEPATH}/img/sharing-ui/invite/Button_Large.png`}
                                                alt="connectToContinue"
                                            />
                                            <div>
                                                <span>Back</span>
                                            </div>
                                        </button>
                                    </>
                                )}
                                {currentView === UNCLAIMABLE && (
                                    <>
                                        <div className={s.board_title}>
                                            Unclaimable. You don't own any {getNFT()}
                                        </div>
                                        <button
                                            className={s.board_pinkBtn}
                                            onClick={() => {
                                                router.push("/");
                                            }}
                                        >
                                            <img
                                                src={`${Enums.BASEPATH}/img/sharing-ui/invite/Button_Large.png`}
                                                alt="connectToContinue"
                                            />
                                            <div>
                                                <span>Go Back</span>
                                            </div>
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/*  Disconnect */}
            {!isFetchingUserQuests && (
                <button className={s.board_disconnect} onClick={() => SignOut()}>
                    <img
                        src={`${Enums.BASEPATH}/img/sharing-ui/invite/Button_Disconnect.png`}
                        alt="connectToContinue"
                    />
                    <div>
                        <span>Disconnect</span>
                    </div>
                </button>
            )}
        </div>
    );
};

const firstHOC = withUserQuestSubmit(ClaimShellForOwningNFT);
export default withUserQuestQuery(firstHOC);