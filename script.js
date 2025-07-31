// Laam Coin Config
const server = new StellarSdk.Server("https://horizon.stellar.org"); // Mainnet
const issuer = "GAL4ECDAXNBMJYFCWIJ32HKVIRLCNEXY664CAZYI3EINQWPLXTMEPR64";
const assetCode = "Laam";
const asset = new StellarSdk.Asset(assetCode, issuer);

// Generate temporary wallet
const keypair = StellarSdk.Keypair.random(); // You can replace this with real key
document.getElementById("publicKey").textContent = keypair.publicKey();

// Add trustline to Laam
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
    showMessage("✅ Trustline to Laam Coin has been added.");
  } catch (e) {
    showMessage("❌ Trustline failed: " + e.message, true);
  }
}

// Get Laam Coin Balance
async function getBalance() {
  try {
    const account = await server.loadAccount(keypair.publicKey());
    const laamBalance = account.balances.find(
      b => b.asset_code === assetCode && b.asset_issuer === issuer
    );
    document.getElementById("balance").textContent = laamBalance ? laamBalance.balance : "0";
  } catch (e) {
    showMessage("❌ Balance check failed: " + e.message, true);
  }
}

// Toggle send form
function toggleSend() {
  document.getElementById("sendForm").style.display = "block";
}

// Send Laam Coin to someone
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
    showMessage("✅ Transaction of " + amount + " Laam sent successfully!");
  } catch (e) {
    showMessage("❌ Transaction failed: " + e.message, true);
  }
}

// Message helper
function showMessage(msg, isError = false) {
  const msgDiv = document.getElementById("message");
  msgDiv.style.color = isError ? "red" : "green";
  msgDiv.textContent = msg;
}
