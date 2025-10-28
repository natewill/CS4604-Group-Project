const argon2 = require("argon2");
const db = require("./connection");

async function hashPassword(user_pw){
    const hashed = await argon2.hash(user_pw, {
        type: argon2.argon2id,
        timeCost: 2,
        memoryCost: 65536,
        parallelism: 1,
        hashLength: 32
    })

    return hashed
}

async function verifyPassword(hash, plain){
    try {
    const match = await argon2.verify(hash, plain);
    return match;
  } catch (err) {
    console.error("Verification error:", err);
    return false;
  }
}

function getPwAndIdFromEmail(email) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT user_password, runner_id FROM runners WHERE email = ?", [email], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] ?? null);
      }
    );
  });
}

//returns -1 if email not in database
//returns -2 if email in database but wrong password
//returns runner_id if email in database and correct password
async function login(email, plain_pw){ 
  const runnerInDb = await getPwAndIdFromEmail(email);
  if(!runnerInDb){
    return -1 //-1 means email not in database
  } 

  if(verifyPassword(runnerInDb.user_password, plain_pw)){
    return runnerInDb.runner_id
  } else {
    return -2 // -2 means email in database but wrong password
  }
}




//test

async function tests(){

  const pw1 = "walkthedog2nite!"
  const hash1 = "$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$8Bndt/gryd5p4eOTO9YC8A"

  await verifyPassword(hash1, pw1).then(console.log)

  console.log(await login("natewilliams@vt.edu", "trainspotter_06"))

}

tests()
