using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Logic.Entity;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Entity;
using Repository.Entity;
using Util;

namespace Api.Controllers
{
    public class ContactDto
    {
        public string Name { get; set; }
    }
    [Route("api/[controller]")]
    [ApiController]
    [AutoWire()]
    public class ContactController : ControllerBase
    {
        public IMediator Mediator { get; set; }
        public ContactRepository ContactRepository { get; set; }
        public IMapper Mapper { get; set; }
        [AllowAnonymous]
        [HttpPost("register")]
        public IActionResult Register([FromBody]ContactDto contactDto)
        {
            // map dto to entity

            var sum = contactDto.Name.ToCharArray().Sum(ch => (int) ch);
            var nameArr = contactDto.Name.Split(" ");
            var lastName = nameArr.Last();
            var fistrName = string.Join(" ", nameArr.SkipLast(1).ToList());
            try
            {
                // save 
                ContactRepository.Create(new Contact() {
                    FirstName = fistrName,
                    LastName = lastName
                });
                var result = Mediator.Send(new CalculateZerosFromInt() {Number = sum});
                return Ok(result.Result);
            }
            catch (Exception ex)
            {
                // return error message if there was an exception
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
