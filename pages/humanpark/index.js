import React from "react";
import s from "/sass/claim/claim.module.css";
import { useSession } from "next-auth/react";
import { ConnectBoard } from "@components/end-user";
import Enums from "enums";

function humanPark() {
    const { data: session, status } = useSession({ required: false });
    // currently disable
    return (
        <>
            <Head>
                <title>DeepSea Challenger Collaboration</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:title" content="Anomura x HumanPark" />
                <meta
                    property="og:description"
                    content="We’ve partnered with HumanPark! Complete quests, earn $SHELL, unlock prizes."
                />
                <meta
                    property="og:image"
                    content="https://anomuragame.com/challenger/Anomura_x_OctoHedz_preview.png"
                />
                <meta property="og:site_name" content="Anomura x HumanPark"></meta>
                <meta property="keywords" content="Anomura, NFT, Game, DeepSea Challenger" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    property="twitter:image"
                    content="https://anomuragame.com/challenger/Anomura_x_HumanPark_preview.png"
                />
                <link rel="icon" href="/challenger/faviconShell.png" />
            </Head>
            <div className={s.app}>
                {!session && <ConnectBoard />}
                {session && process.env.NEXT_PUBLIC_ENABLE_CHALLENGER === "false" && <NotEnabledChallenger />}
                {session && process.env.NEXT_PUBLIC_ENABLE_CHALLENGER === "true" && <CollaborationQuestBoard session={session} collaboration={"humanpark"} />}
            </div>
        </>
    );
}

export default humanPark;
