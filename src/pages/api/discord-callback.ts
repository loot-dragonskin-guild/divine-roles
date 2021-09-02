import prisma from "@server/helpers/prisma";
import {
  addToServer,
  getAccessToken,
  getProfile,
  addRoleForUser,
  AdminRoleID,
  getRolesForUser,
  RolesToIDs,
} from "@server/services/Discord";
import { getBagsInWallet } from "loot-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { bagKeysToCheck, bagFilterFunc } from "@utils/bagFilter";

const api = async (req: NextApiRequest, res: NextApiResponse) => {
  const { code, state }: { code?: string; state?: string } = req.query;
  if (!code || !state) return res.redirect("/unauthorized");

  const accessToken = await getAccessToken(code);
  if (!accessToken) return res.status(403).json({ error: "Invalid token" });
  const profile = await getProfile(accessToken);

  const user = await prisma.user.findUnique({ where: { id: state } });
  if (!user) return res.redirect("/unauthorized");

  // reconfirm user has permissions
  const bags = await getBagsInWallet(user.address.toLowerCase());
  const filteredBags = bags.filter(bagFilterFunc);
  if (!filteredBags.length) return res.redirect("/unauthorized");

  const itemsInBag = filteredBags.reduce((acc: Array<string>, bag) => {
    bagKeysToCheck.map((key) => {
      if (bag[key].toLowerCase().includes("katana")) {
        acc.push(bag[key]);
      }
    });
    return acc;
  }, []);
  console.log(
    `${user.username} ${user.address} has ${
      filteredBags.length
    } items: (${itemsInBag.join(", ")})`
  );
  await prisma.user.update({
    where: { id: user.id },
    data: {
      discordId: profile.id,
      inServer: true,
      username: profile.username,
      items: itemsInBag,
    },
  });
  await addToServer(profile.id, accessToken);
  const newRoleIds = [RolesToIDs["Ser Katana of The Round Table"]];
  console.log("newRoleIds", newRoleIds);
  const { roles: existingRoleIds }: { roles: string[] } = await getRolesForUser(
    profile.id
  );
  console.log("existingRoleIds", existingRoleIds);
  const toAdd = newRoleIds?.filter((x) => !existingRoleIds?.includes(x)) || [];
  console.log("toAdd", toAdd);
  for (const roleId of toAdd) {
    if (roleId == AdminRoleID) continue;
    await new Promise((resolve) => setTimeout(resolve, 250));
    console.log("Adding role for user", roleId, profile.id);
    await addRoleForUser(roleId, profile.id);
  }
  return res.redirect("/welcome");
};

export default api;
