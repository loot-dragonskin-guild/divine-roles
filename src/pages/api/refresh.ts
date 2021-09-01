import prisma from "@server/helpers/prisma";
import {
  addRoleForUser,
  AdminRoleID,
  getRolesForUser,
  removeFromServer,
  removeRoleForUser,
  RolesToIDs,
} from "@server/services/Discord";
import dayjs from "dayjs";
import { getBagsInWallet } from "loot-sdk";
import { NextApiHandler } from "next";
import { bagKeysToCheck, bagFilterFunc } from "@utils/bagFilter";

const api: NextApiHandler = async (_req, res) => {
  const usersToRefresh = await prisma.user.findMany({
    where: {
      discordId: { not: null },
      lastChecked: { lt: dayjs().subtract(10, "seconds").toDate() },
    },
  });
  for (const user of usersToRefresh) {
    const bags = await getBagsInWallet(user.address.toLowerCase());
    const filteredBags = bags.filter(bagFilterFunc);
    const itemsInBag = filteredBags.reduce((acc: Array<string>, bag) => {
      bagKeysToCheck.map((key) => {
        if (bag[key].toLowerCase().includes("dragon")) {
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
    if (filteredBags.length == 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastChecked: new Date(), inServer: false, robes: [] },
      });
      try {
        console.log(`Removing ${user.username} from server`);
        await removeFromServer(user.id);
      } catch (err) {
        console.log(err);
      }
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastChecked: new Date(),
          inServer: true,
          items: itemsInBag,
        },
      });
      if (user.discordId && user.inServer) {
        const newRoleIds = itemsInBag.map((name) => RolesToIDs[name]);
        const { roles: existingRoleIds }: { roles: string[] } =
          await getRolesForUser(user.discordId);
        const toRemove =
          existingRoleIds?.filter((x) => !newRoleIds?.includes(x)) || [];
        const toAdd =
          newRoleIds?.filter((x) => !existingRoleIds?.includes(x)) || [];

        for (const roleId of toRemove) {
          if (roleId == AdminRoleID) continue;
          await new Promise((resolve) => setTimeout(resolve, 250));
          console.log("Removing role for user", roleId, user.discordId);
          await removeRoleForUser(roleId, user.discordId);
        }
        for (const roleId of toAdd) {
          if (roleId == AdminRoleID) continue;
          await new Promise((resolve) => setTimeout(resolve, 250));
          console.log("Adding role for user", roleId, user.discordId);
          await addRoleForUser(roleId, user.discordId);
        }
      }
    }
  }
  return res.json({ success: true });
};

export default api;
