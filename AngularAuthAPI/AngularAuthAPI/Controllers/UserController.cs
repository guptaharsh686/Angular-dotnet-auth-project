using AngularAuthAPI.Context;
using AngularAuthAPI.Controllers.Dto;
using AngularAuthAPI.Helpers;
using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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
            var newAccessToken = user.Token;
            var newRefreshToken = CreateRefreshToken();
            user.RefreshToken = newRefreshToken;
            await _authContext.SaveChangesAsync(); 

            return Ok(new TokenApiDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });

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

        [Authorize]
        [HttpGet("users")]
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
                new Claim(ClaimTypes.Name,$"{user.Username}")
            });

            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.UtcNow.AddSeconds(10),
                SigningCredentials = credentials
            };

            var token = jwtHandler.CreateToken(tokenDescriptor);

            return jwtHandler.WriteToken(token);

        }

        private string CreateRefreshToken()
        {
            var tokenBytes = RandomNumberGenerator.GetBytes(64);

            var refreshToken = Convert.ToBase64String(tokenBytes);  

            var tokenInUser = _authContext.Users
                                .Any(a => a.RefreshToken == refreshToken);

            if(tokenInUser)
            {
                return CreateRefreshToken();
            }

            return refreshToken;
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string ExpiredToken)
        {
            var key = Encoding.ASCII.GetBytes("Very very secret key.....");

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateLifetime = false,
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            SecurityToken securityToken;

            var principal = tokenHandler.ValidateToken(ExpiredToken,tokenValidationParameters,out securityToken);
            
            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if(jwtSecurityToken == null || ! jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("This is invalid token");
            }

            return principal;

        }
    }
}
