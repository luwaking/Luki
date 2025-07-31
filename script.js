// Laam Coin config
const server = new StellarSdk.Server("https://horizon.stellar.org"); // Mainnet
const issuer = "GB..."; // 👉 LAAM Coin issuer address (bedel)
const assetCode = "LAAM";
const keypair = StellarSdk.Keypair.random(); // Temporary wallet

document.getElementById("publicKey").textContent = keypair.publicKey();

const asset = new StellarSdk.Asset(assetCode, issuer);

// Add trustline
async function addTrustline() {
  try {
    const account = await server.loadAccount(keypair.publicKey());
    const fee = await server.fetchBaseFee();
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: StellarSdk.Networks.PUBLIC
    })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: asset
      }))
      .setTimeout(100)
      .build();
    
    tx.sign(keypair);
    await server.submitTransaction(tx);
    showMessage("Trustline to LAAM added successfully.");
  } catch (e) {
    showMessage("Trustline error: " + e.message, true);
  }
}

// Get balance
async function getBalance() {
  const account = await server.loadAccount(keypair.publicKey());
  const laamBalance = account.balances.find(b => b.asset_code === assetCode && b.asset_issuer === issuer);
  document.getElementById("balance").textContent = laamBalance ? laamBalance.balance : "0";
}

// Show send form
function toggleSend() {
  document.getElementById("sendForm").style.display = "block";
}

// Send LAAM Coin
async function sendLaam() {
  const toAddress = document.getElementById("toAddress").value;
  const amount = document.getElementById("amount").value;

  try {
    const account = await server.loadAccount(keypair.publicKey());
    const fee = await server.fetchBaseFee();
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: StellarSdk.Networks.PUBLIC
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: toAddress,
        asset: asset,
        amount: amount
      }))
      .setTimeout(100)
      .build();

    tx.sign(keypair);
    await server.submitTransaction(tx);
    showMessage("Transaction successful!");
  } catch (e) {
    showMessage("Transaction failed: " + e.message, true);
  }
}

function showMessage(msg, error = false) {
  const div = document.getElementById("message");
  div.style.color = error ? "red" : "green";
  div.textContent = msg;
}
