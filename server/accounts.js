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

//params
//- runner_data
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
// - plain_pw - unhashed plain pw as string
async function signup(runner_data, plain_pw){
  //check if email in database already
  //with the getPwandID function before running this function
  //then run this function
  //check if email already in database in this function just incase, return -1
  //else
  //hash password
  //insert into database
  //return runner id if everything works out

  var emailInDb = await getPwAndIdFromEmail(runner_data.email);

  if(emailInDb){
    return -1
  } 

  runner_data.user_password = await hashPassword(plain_pw)

  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO runners SET ?", runner_data, (err, result) => {
        if (err) return reject(err)
        resolve(result.insertId);
      }
    )
  })
}




//test
/*
async function tests(){

    const runners = [
    {
      first_name: "Nate",
      middle_initial: "D",
      last_name: "Williams",
      email: "natewilliams@vt.edu",
      user_password: null, 
      is_leader: true,
      min_pace: 7,
      max_pace: 8,
      min_dist_pref: 3,
      max_dist_pref: 5
    },
    {
      first_name: "Lara",
      middle_initial: "K",
      last_name: "Johnson",
      email: "lara.k.johnson@example.com",
      user_password: null,
      is_leader: false,
      min_pace: 6,
      max_pace: 7,
      min_dist_pref: 2,
      max_dist_pref: 10
    },
    {
      first_name: "Ethan",
      middle_initial: "M",
      last_name: "Garcia",
      email: "ethan.m.garcia@example.org",
      user_password: null,
      is_leader: true,
      min_pace: 8,
      max_pace: 9,
      min_dist_pref: 4,
      max_dist_pref: 12
    }
  ];

  const pw1 = "walkthedog2nite!"
  const hash1 = "$argon2id$v=19$m=16,t=2,p=1$cnVubmluZzE$8Bndt/gryd5p4eOTO9YC8A"

  await verifyPassword(hash1, pw1).then(console.log)

  console.log(await login("natewilliams@vt.edu", "trainspotter_06"))

  runner = {

  }
  console.log(await signup(runners[2], "boodfagdas"))
}

tests()
*/