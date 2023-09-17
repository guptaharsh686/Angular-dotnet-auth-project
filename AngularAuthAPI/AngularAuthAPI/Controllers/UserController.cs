using AngularAuthAPI.Context;
using AngularAuthAPI.Helpers;
using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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

            var user = await _authContext.Users.FirstOrDefaultAsync(x => x.Username == userObject.Username);
            if (user == null)
            {
                return NotFound(new {Message = "Username or Psssword is incorrect" });
            }

            if (! PasswordHasher.verifyPassword(userObject.Password, user.Password))
            {
                return BadRequest(new
                {
                    Message = "Username or Psssword is incorrect"
                });
            }

            user.Token = CreateJwtToken(user);

            await _authContext.SaveChangesAsync(); 

            return Ok(new
            {
                Token = user.Token,
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

        [HttpGet]
        public async Task<ActionResult<User>> GetAllUsers()
        {
            return Ok(await _authContext.Users.ToListAsync());
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


        private string CreateJwtToken(User user)
        {
            var jwtHandler = new JwtSecurityTokenHandler();

            var key = Encoding.ASCII.GetBytes("Very very secret key.....");

            var identity = new ClaimsIdentity( new Claim[]
            {
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Name,$"{user.FirstName} {user.LastName}")
            });

            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = credentials
            };

            var token = jwtHandler.CreateToken(tokenDescriptor);

            return jwtHandler.WriteToken(token);

        }
    }
}
