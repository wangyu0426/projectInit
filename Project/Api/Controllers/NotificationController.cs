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
    public class NotificationDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DateTime { get; set; }
        public bool IsRead { get; set; }


        public StudentDto Student { get; set; }
    }

    public class NotificationDtoMapperProfile : Profile
    {
        public NotificationDtoMapperProfile()
        {
            CreateMap<Notification, NotificationDto>();
            CreateMap<NotificationDto, Notification>();
        }
    }
    [Route("api/[controller]")]
    [ApiController]
    [AutoWire()]
    public class NotificationController : ControllerBase
    {
        public IMediator Mediator { get; set; }
        public IMapper Mapper { get; set; }
        public NotificationRepository NotificationRepository { get; set; }
        [AllowAnonymous]
        [HttpGet]
        public IList<NotificationDto> List()
        {
            // map dto to entity


            return NotificationRepository.List().Select(n =>Mapper.Map<NotificationDto>(n)).ToList();
        }
    }
}
