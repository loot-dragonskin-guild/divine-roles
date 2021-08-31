import { NextApiRequest, NextApiResponse } from 'next';
import { utils } from 'ethers';
import { SIGNATURE_TEXT } from '@app/features/useSignature';
import { getLoginURL } from '@server/services/Discord';
import { getBagsInWallet } from 'loot-sdk';
import prisma from '@server/helpers/prisma';

import dragonJson from './dragon_ids.json';

// const dragonParser = async (bag) => {
//   console.log(dragonJson[5])
// }

const api = async (req: NextApiRequest, res: NextApiResponse) => {
  const { signature, account }: { signature?: string; account?: string } =
    req.query;
  if (!signature || !account)
    return res.status(400).json({ error: 'Missing signature or account' });
  const verified =
    account.toLowerCase() ==
    utils.verifyMessage(SIGNATURE_TEXT, signature).toLowerCase();
  if (verified) {
    const bags = await getBagsInWallet(account.toLowerCase());
    // todo: filter on parts of body that could have dragonskin
    const filteredBags = bags.filter(bag => {
      // if (dragonJson.hasOwnProperty(bag.id)) return true
      const bagId = bag.id;
      for (let loot of dragonJson) {
        if (loot[bagId]) {
          console.log(loot)
          return true
        } 
      }
      return false
      // bag.foot.toLowerCase().includes('dragonskin')
    });

    if (filteredBags.length > 0) {
      let [user] = await prisma.user.findMany({
        where: { address: account.toLowerCase() }
      });
      if (!user) {
        user = await prisma.user.create({
          data: { address: account.toLowerCase() }
        });
      }
      console.log(user)
      return res.redirect(getLoginURL(user.id));
    } else return res.redirect('/unauthorized');
  } else return res.redirect('/unauthorized');
};

export default api;
