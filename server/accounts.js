const argon2 = require("argon2");
const db = require("./connection");

//returns argon2id hashed pw
//params
//user_pw - plain text password as a string
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

//returns true if plain password matches hash
//params
//hash - argon2id produced hash
//plain - plain text password as a string
async function verifyPassword(hash, plain){
    try {
    const match = await argon2.verify(hash, plain);
    return match;
  } catch (err) {
    console.error("Verification error:", err);
    return false;
  }
}

//returns dict if email in database of
//{
//  user_password: ____
//  runner_id: ____
//}
// otherwise returns null
//
//params
//email - email of user as a string
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
//params 
//email - email of user as a string
//plain_pw - non hashed password as a string
async function login(email, plain_pw){ 
  const runnerInDb = await getPwAndIdFromEmail(email.trim().toLowerCase());
  if(!runnerInDb){
    return -1 //-1 means email not in database
  } 

  if(await verifyPassword(runnerInDb.user_password, plain_pw)){
    return runnerInDb.runner_id
  } else {
    return -2 // -2 means email in database but wrong password
  }
}

//params
//runner_data -
/*
{
    first_name: string,
    last_name: string,
    middle_initial, string,
    email, string,
    user_password, null,
    is_leader, bool,
    min_pace, int,
    max_pace, int,
    min_dist_pref, int,
    max_dist_pref, int
}
*/
//plain_pw - unhashed plain pw as string -
async function signup(runner_data, plain_pw){

  runner_data.email = runner_data.email.trim().toLowerCase();

  var emailInDb = await getPwAndIdFromEmail(runner_data.email)

  if(emailInDb){
    return -1
  } 

  // only pass columns that actually exist in the table
  const row = {
    first_name: runner_data.first_name ?? null,
    last_name: runner_data.last_name ?? null,
    middle_initial: runner_data.middle_initial ?? null,
    email: runner_data.email,
    user_password: await hashPassword(plain_pw),
    is_leader: !!runner_data.is_leader,        
    min_pace: runner_data.min_pace ?? null,
    max_pace: runner_data.max_pace ?? null,
    min_dist_pref: runner_data.min_dist_pref ?? null,
    max_dist_pref: runner_data.max_dist_pref ?? null,
  };

  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO runners SET ?", row, (err, result) => {
        if (err) return reject(err)
        resolve(result.insertId);
      }
    )
  })
}


module.exports = { signup, signin: login, login, getPwAndIdFromEmail, hashPassword, verifyPassword };
