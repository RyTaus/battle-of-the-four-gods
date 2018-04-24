const TIME_PER_ROUND = 5;

const START_ENERGY = 45;
const ATTACK_DAMAGE = 3;
const COST_PER_ATTACK = 1;
const COST_PER_DEFEND = 1;
const DEFEND_REFUND = 1;
const performAttack = (attacker, defender, isDefended) => {
  if (isDefended) {
    return defender.decreaseEnergy(-1);
  }
  return defender.decreaseEnergy(ATTACK_DAMAGE);
}


module.exports = {
  TIME_PER_ROUND,

  START_ENERGY,
  ATTACK_DAMAGE,
  COST_PER_ATTACK,
  COST_PER_DEFEND,
  DEFEND_REFUND,
  performAttack
};
