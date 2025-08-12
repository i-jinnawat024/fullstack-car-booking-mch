const User = require('../Models/Auth');const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const {username, password} = req.body;
    const user = await User.findOne({username});
    if (!user) {
      return res.render('login', {
        error: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง',
        username: username || '',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.render('login', {
        error: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง',
        username: username,
      });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname,
      numberID: user.numberID,
      organization: user.organization,
      mobile_number: user.mobile_number,
    };

    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).send('Internal server Error');
  }
};

exports.list = async (req, res) => {
  try {
    const users = await User.find();
    res.render('login', {username: '' || req.query.username, error: null});
  } catch (error) {
    console.log(error);
  }
};
