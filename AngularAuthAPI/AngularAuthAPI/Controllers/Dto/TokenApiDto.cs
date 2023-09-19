namespace AngularAuthAPI.Controllers.Dto
{
    public class TokenApiDto
    {
        public string AccessToken { get; set; } = string.Empty;

        public string RefreshToken { get; set; } = string.Empty;
    }
}
