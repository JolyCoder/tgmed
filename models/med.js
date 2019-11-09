const db = require("../parts/db")

exports.addMed_model = (med, cb) => {
  db.get().collection("meds").insert(med, (err, result) => {
    cb(err, result);
  });
};

exports.getMed_model = (cb) => {
  db.get().collection("meds").find().toArray((err, result) => {
    cb(err, result);
  });
};

exports.getMedbyNumber_model = (num, cb) => {
  db.get().collection("meds").find().toArray((err, result) => {
    for (var clinic of result) {
      if (clinic.num == num) {
        return cb(err, clinic);
      }
    }
  });
  return cb(err, "not find");
};
