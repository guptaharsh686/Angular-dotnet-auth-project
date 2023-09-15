using AngularAuthAPI.Context;
using AngularAuthAPI.Helpers;
using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.RegularExpressions;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _authContext;

        public UserController(AppDbContext appDbContext)
        {
            _authContext = appDbContext;
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] User userObject)
        {
            if (userObject == null) 
            {
                return BadRequest();
            }

            var user = await _authContext.Users.FirstOrDefaultAsync(x => x.Username == userObject.Username && x.Password == userObject.Password);
            if (user == null)
            {
                return NotFound(new {Message = "User Not Found"});
            }

            return Ok(new
            {
                Message = "Login Sucess!"
            }); ;

        }


        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] User userObject)
        {
            if (userObject == null)
            {
                return BadRequest();
            }

            //check username
            if(await CheckUsernameExistAsync(userObject.Username)) 
            {
                return BadRequest(new
                {
                    Message = "Username already exist"
                });
            }


            //check email
            if (await CheckEmailExistAsync(userObject.Email))
            {
                return BadRequest(new
                {
                    Message = "Email already exist"
                });
            }


            //check passwordShrength
            var pass = CheckPasswordStrength(userObject.Password);

            if(!string.IsNullOrEmpty(pass))
            {
                return BadRequest(new
                {
                    Message = pass.ToString()
                });
            }

            userObject.Password = PasswordHasher.HashPassword(userObject.Password);
            userObject.Role = "User";
            userObject.Token = "";

            await _authContext.Users.AddAsync(userObject);
            await _authContext.SaveChangesAsync();
            return Ok(new
            {
                Message = "User Registered"
            });
        }


        private Task<bool> CheckUsernameExistAsync(string username) => _authContext.Users.AnyAsync(x => x.Username == username);

        private Task<bool> CheckEmailExistAsync(string email) => _authContext.Users.AnyAsync(x => x.Email == email);


        private string CheckPasswordStrength(string password)
        {
            StringBuilder stringBuilder = new StringBuilder();

            if(password.Length < 8)
            {
                stringBuilder.Append("Minimum password length should be 8" + Environment.NewLine);
            }
            if ( ! (Regex.IsMatch(password, "[a-z]") && Regex.IsMatch(password, "[A-Z]") && Regex.IsMatch(password, "[0-9]")))
            {
                stringBuilder.Append("Password should be AlphaNumeric" + Environment.NewLine);
            }
            if ( ! (Regex.IsMatch(password, "[!,@,#,%,^,&,*,(,),_,+,=,{,},|,;,',:,\\,.,/,<,>,?,~]")))
            {
                stringBuilder.Append("Password should contain special characters" + Environment.NewLine);
            }

            return stringBuilder.ToString();    
        }
    }
}
