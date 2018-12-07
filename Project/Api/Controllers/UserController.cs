using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Entity;
using Repository.Entity;
using Util;

namespace Api.Controllers
{
    public class UserDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string HomePhone { get; set; }
        public string WorkPhone { get; set; }
        public string Mobile { get; set; }
        public string Avatar { get; set; }
    }

    public class UserDtoMapperProfile : Profile
    {
        public UserDtoMapperProfile()
        {
            CreateMap<User, UserDto>();
            CreateMap<UserDto, User>();
        }
    }
    [Route("api/[controller]")]
    [ApiController]
    [AutoWire()]
    public class UserController : ControllerBase
    {
        public IMediator Mediator { get; set; }
        public IMapper Mapper { get; set; }
        public UserRepository UserRepository { get; set; }
        [AllowAnonymous]
        [HttpGet("{id}", Name = "Get")]
        public UserDto Get(int id)
        {
            // map dto to entity


            return Mapper.Map<UserDto>(UserRepository.GetById(id));
        }
    }
}
