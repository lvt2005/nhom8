"use client";
import React, { useMemo } from "react";

type UserSummary = {
  _id?: string;
  fullName?: string;
  avatar?: string;
};

type GroupUser = { user_id?: UserSummary | string | null };

export const GroupAvatar = ({
  groupId,
  title,
  avatar,
  users,
  className,
}: {
  groupId: string;
  title?: string;
  avatar?: string;
  users: GroupUser[];
  className?: string;
}) => {
  const tiles = useMemo(() => {
    if (avatar) return [];
    const members = (users || [])
      .map(u => u?.user_id)
      .filter((m): m is UserSummary => typeof m === "object" && m !== null);
    
    if (members.length === 0) return [];
    return members.slice(0, 4);
  }, [avatar, users, groupId]);

  if (avatar) {
    return (
      <div className={className}>
        <img src={avatar} className="w-full h-full object-cover" />
      </div>
    );
  }

  const fallback = (title || "G").charAt(0).toUpperCase();

  if (!tiles.length) {
    return (
      <div className={`${className} bg-purple-500 flex items-center justify-center text-white font-bold`}>
        {fallback}
      </div>
    );
  }

  const renderAvatar = (u: UserSummary, cls: string) => {
    return (
      <div className={`${cls} bg-gray-200 overflow-hidden`}>
        {u.avatar ? (
          <img src={u.avatar} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white font-bold text-[10px]">
            {(u.fullName || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${className} relative bg-gray-100 overflow-hidden`}>
      {tiles.length === 1 && renderAvatar(tiles[0], "w-full h-full")}
      
      {tiles.length === 2 && (
        <>
          {renderAvatar(tiles[0], "absolute top-0 left-0 w-1/2 h-full")}
          {renderAvatar(tiles[1], "absolute top-0 right-0 w-1/2 h-full")}
        </>
      )}

      {tiles.length === 3 && (
        <>
          {renderAvatar(tiles[0], "absolute top-0 left-0 w-1/2 h-full")}
          <div className="absolute top-0 right-0 w-1/2 h-full flex flex-col">
            {renderAvatar(tiles[1], "w-full h-1/2")}
            {renderAvatar(tiles[2], "w-full h-1/2")}
          </div>
        </>
      )}

      {tiles.length >= 4 && (
        <div className="w-full h-full grid grid-cols-2">
          {tiles.slice(0, 4).map((u, i) => (
            <div key={i} className="w-full h-full overflow-hidden">
               {u.avatar ? (
                  <img src={u.avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white font-bold text-[10px]">
                    {(u.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
