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
    public class StudentDto
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

    public class StudentDtoMapperProfile : Profile
    {
        public StudentDtoMapperProfile()
        {
            CreateMap<Student, StudentDto>();
            CreateMap<StudentDto, Student>();
        }
    }
    [Route("api/[controller]")]
    [ApiController]
    [AutoWire()]
    public class StudentController : ControllerBase
    {
        public IMediator Mediator { get; set; }
        public IMapper Mapper { get; set; }
        public StudentRepository StudentRepository { get; set; }
        [AllowAnonymous]
        [HttpGet]
        public IList<StudentDto> List()
        {
            // map dto to entity


            return StudentRepository.List()
                .Select(st=>Mapper.Map<StudentDto>(st)).ToList();
        }
    }
}
