import React, { useState, useMemo, useEffect, useRef } from "react";
import { ZIM } from "zego-zim-web";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { defineConfig } from 'vite';
import { config } from 'dotenv';


const App = () => {
  const zpRef = useRef(null);

  // 1. Stable user identity across renders
  const [userInfo] = useState(() => {
    const id = "user" + Math.floor(Math.random() * 1000);
    return {
      userID: id,
      userName: "Mere_Pyare_" + id,
    };
  });

  const appID = 0;
  const serverSecret = "";

  // 2. Generate token only once per user
  const TOKEN = useMemo(() => {
    return ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      null,
      userInfo.userID,
      userInfo.userName,
    );
  }, [userInfo.userID, userInfo.userName]);

  useEffect(() => {
    const zp = ZegoUIKitPrebuilt.create(TOKEN);
    zpRef.current = zp;
    zp.addPlugins({ ZIM });

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [TOKEN]);

  function invite(callType) {
    if (!zpRef.current) return;

    const targetUserID = prompt("Receiver's userID:");
    if (!targetUserID || !targetUserID.trim()) return;

    const targetUserName = prompt("Receiver's userName:") || targetUserID;

    zpRef.current
      .sendCallInvitation({
        callees: [{ userID: targetUserID.trim(), userName: targetUserName.trim() }],
        callType,
        timeout: 60,
      })
      .then((res) => {
        console.warn("Invitation sent:", res);
      })
      .catch((err) => {
        console.error("Invitation failed:", err);
      });
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-gray-900 border border-gray-800 shadow-xl p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            User Information
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              <span className="font-medium text-gray-200">UserName:</span>{" "}
              {userInfo.userName}
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-medium text-gray-200">UserId:</span>{" "}
              {userInfo.userID}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-5">
          <p className="text-sm text-gray-500 mb-3">Start a call</p>
          <div className="flex gap-3">
            <button
              onClick={() => invite(ZegoUIKitPrebuilt.InvitationTypeVoiceCall)}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              Voice Call
            </button>
            <button
              onClick={() => invite(ZegoUIKitPrebuilt.InvitationTypeVideoCall)}
              className="flex-1 rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-600 active:scale-95 cursor-pointer"
            >
              Video Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;