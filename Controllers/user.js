const bcrypt = require('bcryptjs');
const Auth = require('../Models/Auth');
const Booking = require('../Models/booking');
exports.create = async (req, res) => {
  const {
    username,
    firstname,
    lastname,
    numberID,
    password,
    organization,
    role,
    birth_year,
    mobile_number,
  } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword)
  try {
    await Auth.create({
      firstname,
      lastname,
      numberID,
      username,
      password: hashedPassword,
      organization,
      role,
      birth_year,
      mobile_number,
    });
    req.flash('success_msg', 'User created successfully');
    res.redirect('/setting/member');
  } catch (err) {
    console.error(err.message);
    const page = parseInt(req.query.page, 10) || 1; // Current page
    const limit = 8; // Users per page
    const skip = (page - 1) * limit; // Skip users based on the current page
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
    const {
      numberID,
      password,
      firstname,
      lastname,
      organization,
      role,
      mobile_number,
      birth_year,
    } = req.body;

    let roleQuery = searchQuery;
    if (searchQuery) {
      if (searchQuery === 'พนักงาน') {
        roleQuery = 'user';
      } else if (searchQuery === 'ผู้จัดรถ') {
        roleQuery = 'admin';
      } else if (searchQuery === 'ผู้อนุมัติ') {
        roleQuery = 'approver';
      } else if (searchQuery === 'พนักงานขับรถ') {
        roleQuery = 'driver';
      }
    }

    const query = searchQuery
      ? {
          $or: [
            {firstname: {$regex: searchQuery, $options: 'i'}},
            {lastname: {$regex: searchQuery, $options: 'i'}},
            {numberID: {$regex: searchQuery, $options: 'i'}},
            {organization: {$regex: searchQuery, $options: 'i'}},
            {role: {$regex: roleQuery, $options: 'i'}},
          ],
        }
      : {};

    const totalUsers = await Auth.countDocuments(query);

    if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
      let users = await Auth.aggregate([
        {$match: query},
        {
          $addFields: {
            sortRole: {
              $switch: {
                branches: [
                  {case: {$eq: ['$role', 'approver']}, then: 1},
                  {case: {$eq: ['$role', 'admin']}, then: 2},
                  {case: {$eq: ['$role', 'user']}, then: 3},
                  {case: {$eq: ['$role', 'driver']}, then: 4},
                ],
                default: 5, // Handle unexpected roles
              },
            },
          },
        },
        {$sort: {sortRole: 1}}, // Sort by the mapped role order
        {$skip: skip},
        {$limit: limit},
      ]);
      req.flash('error_msg', 'รหัสพนักงานมีอยู่แล้ว');
      const error_msg = req.flash('error_msg');
      const totalPages = Math.ceil(totalUsers / limit);
      return res.status(400).render('member', {
        user: req.session.user || null,
        users,
        currentPage: page,
        totalPages,
        totalUsers,
        searchQuery,
        userLoggedIn: !!req.session.user,
        firstname: firstname,
        lastname: lastname,
        numberID: numberID,
        username: numberID,
        organization: organization,
        role: role,
        birth_year: birth_year,
        mobile_number: mobile_number,
        error_msg: error_msg,
      });
    } else {
      // Handle other errors
      res.status(500).send('An error occurred while updating the user');
    }
  }
};
exports.update = async (req, res) => {
  const {id} = req.params;
  const {
    newfirstname,
    newlastname,
    newmobile_number,
    oldpassword,
    newpassword,
    newpasswordconfirm,
  } = req.body;

  const start = new Date(
    new Date(req.body.birth_year).getTime() + 7 * 60 * 60 * 1000
  );

  try {
    let user = await Auth.findById(id);

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/');
    }

    const booking = await Booking.find({user_id: id});

    if (
      newfirstname ||
      newlastname ||
      newmobile_number ||
      (req.body.birth_year && booking.length > 0)
    ) {
      // Update user object with new values or retain existing ones
      user.firstname = newfirstname || user.firstname;
      user.lastname = newlastname || user.lastname;
      user.mobile_number = newmobile_number || user.mobile_number;

      // Only update birth_year if provided
      if (req.body.birth_year) {
        user.birth_year = req.body.birth_year;
      }

      // Update Booking records associated with the user
      await Booking.updateMany(
        {user_id: id},
        {
          $set: {
            userinfo: `${newfirstname || user.firstname} ${newlastname || user.lastname}`,
            organization: user.organization, // Assuming organization is already defined somewhere
            mobile_number: newmobile_number || user.mobile_number,
          },
        }
      );

      // Save the updated user
      await user.save();
    }

    // Case 1: Logged in and changing password (old password required)
    if (newpassword && newpasswordconfirm && oldpassword) {
      if (!bcrypt.compareSync(oldpassword, user.password)) {
        req.flash('error_old', 'รหัสผ่านเดิมไม่ถูกต้อง');
        return res.render('change_PSW', {
          userLoggedIn: true,
          oldpassword: oldpassword || '',
          user: user,
          error_old: req.flash('error_old'),
        });
      }
      user.password = bcrypt.hashSync(newpassword, 10);
      await user.save();
    }

    // Case 2: Forgot password (only new password required)
    if (newpassword && newpasswordconfirm && !oldpassword) {
      if (newpassword !== newpasswordconfirm) {
        req.flash('error_new', 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
        return res.render('reset_PSW', {
          userLoggedIn: false,
          newpassword: newpassword || '',
          newpasswordconfirm: newpasswordconfirm || '',
          error_new: req.flash('error_new'),
        });
      }
      user.password = bcrypt.hashSync(newpassword, 10);
      await user.save();
    }

    if (newpassword && newpasswordconfirm && oldpassword) {
      req.session.destroy(() => {
        res.redirect(`/?username=${encodeURIComponent(user.username)}`);
      });
    } else {
      res.redirect('/profile/' + id);
    }
  } catch (err) {
    console.error(err);
    res.redirect('/profile/' + id);
  }
};

exports.read = async (req, res) => {
  try {
    const id = req.params.id;
    const User = await Auth.findOne({_id: id}).exec();
    res.send(User);
  } catch (error) {
    console.log(error);
  }
};
