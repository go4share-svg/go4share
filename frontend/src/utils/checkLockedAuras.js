import { auraShopItems } from "../data/auraShopItems.js";

export const checkLockedAuras = (user) => {
  let unlocked = false;

  auraShopItems.forEach((aura) => {
    const alreadyOwned = user.ownedAuras?.includes(aura.id);
    const canUnlock = aura.unlock(user);

    if (!alreadyOwned && canUnlock) {
      user.ownedAuras.push(aura.id);
      unlocked = true;
    }
  });

  return unlocked;
};