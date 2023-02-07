import axios from 'axios';
import express from 'express';

const router = express.Router();

type CoinUnit = {
  tx_hash_big_endian: string,
  tx_hash: string,
  tx_output_n: boolean,
  script: string,
  value: number,
  value_hex: string,
  confirmations: number,
  tx_index: number,
}[]

/**
 * To find the closest ideal unit of coin from wallet
 * By default that will be a big number
 *
 * @param {number} value - number
 * @param {Array | CoinUnit} SortedByValue - array
 * @return {number} index number
 */
const getIdealCoinUnit = async (value:number, SortedByValue:CoinUnit): Promise<number> => {
  let closestValue = Infinity;
  // We will store the index of the element
  let closestIndex = -1;
  for (let i = 0; i < SortedByValue.length; ++i) {
    const diff = Math.abs(SortedByValue[i].value - value);
    if (diff < closestValue) {
      closestValue = diff;
      closestIndex = i;
    }
  }

  if (SortedByValue[closestIndex].value < value && SortedByValue.length > closestIndex + 1) {
    return closestIndex + 1;
  }

  return closestIndex;
};

router.get('/api/prepare-unspent-outputs/', async (req, res) => {
  const { address, amount } = req.query;
  const params = {
    active: address,
  };

  /**
   * To track unspent crypto transaction from blockchain network
   * wallet
   */
  const wallet:[] = await axios.get('https://blockchain.info/unspent', { params })
    .then((response) => response.data.unspent_outputs).catch((error) => {
      res.status(405).send({ error });
    });

  const SortedByValue : CoinUnit = wallet
    .sort((x: { value: number }, y: { value: number }) => (x.value < y.value ? -1 : 1));

  let calculation = 0;
  const debt = Number(amount);

  // considered coin units to make transaction from UTXO
  const beReady : CoinUnit = SortedByValue.filter((coin: { value: number }) => {
    if (coin.value <= debt && calculation < debt) {
      calculation += coin.value;
      return coin;
    }

    if (coin.value > debt && calculation < debt) {
      calculation += coin.value;
      return coin;
    }

    return null;
  });

  // get a ideal coin unit maybe for alternative good option
  const cIndex = await getIdealCoinUnit(debt, SortedByValue);

  /**
   * super layer selection for making the right choice
   * forward the best coin units from wallet
   */
  const dif1 = Math.abs(calculation - debt);
  const dif2 = Math.abs(SortedByValue[cIndex].value - debt);

  if (dif2 <= dif1 && debt <= SortedByValue[cIndex].value) {
    beReady.splice(0, beReady.length);
    beReady.push(SortedByValue[cIndex]);
  }

  // Good To Go & Enjoy!
  if (calculation < debt) {
    res.status(409).send({ message: 'Not enough funds' });
  } else {
    res.status(200).send(beReady);
  }
});

export { router as prepareUnspentOutputsRouter };
