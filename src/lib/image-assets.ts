export interface ImageAsset { src: string; width: number; height: number; blurDataURL: string; }
/** Generated image aliases and tiny inline placeholders. */
export const imageAssets: Record<string, ImageAsset> = {
  "/images/about-polaroids/collaboration.jpg": {
    "src": "/images/about-polaroids/collaboration.jpg",
    "width": 1290,
    "height": 860,
    "blurDataURL": "data:image/webp;base64,UklGRtQAAABXRUJQVlA4IMgAAAAQBQCdASoYABAAPt1apkyopSOiMAgBEBuJYgCdMoMrZ+gayU1ZxsDYv0dKqwHUyl4oAMlp2z2b6pzL4cXsGBI9JN8enxhGElJCf8lBBIMK9DudVP1iygD7rhC1qn5dgRq9PWY4n0KVmz+ZECxDTMLCN0n7j6ne6e5ifpRESFwA7HX399/5S19g7x4wxzSftWhIvY9DuWhlWFkl705mpFO05puHYxkXxyD1stLtA/74QOAED2HrR6z3JVc8KyRiVlMBfmT2g2QAAA=="
  },
  "/images/about-polaroids/creativity.jpg": {
    "src": "/images/about-polaroids/creativity.jpg",
    "width": 1024,
    "height": 1024,
    "blurDataURL": "data:image/webp;base64,UklGRkgBAABXRUJQVlA4IDwBAACwBgCdASoYABgAPt1mq1EopSOiqAgBEBuJZgCdIELJKl2DfA0gTMQSe20HhGw7lSF3/57PzNNvzDtYCCznAAD+3Y0Hb/3Ozzii79BcLUptAua5Sg2+M9CtjmIK6/ePBcxbJzBQR6qB+CVehWsb4tWTvXRkNGgGgYK3LOD8XZwclaNZiyQeFtz0LMEjfDMW831XjUgb42aFZ107kvVbHA3xn+G5CoIbNW0lodVRk6A5y920XWqhtnC5DkTwzC0y0CWeUrNFz4MXSuyrWjOvpBhCOxYKzuiaEtcn2pepVJ6JlXW6L7jgQKbxrap7J45KhKmIweKG0h8b8qA78s7mvgbgLtpPO52fFznfNTzXW2OC9ZGgJFAX+V9RcP4udlQOx4qD18xsavU4/f0iDwnOhqk2Y07DSFmb99cwAAAA"
  },
  "/images/about-polaroids/curiosity.jpg": {
    "src": "/images/about-polaroids/curiosity.jpg",
    "width": 1024,
    "height": 1024,
    "blurDataURL": "data:image/webp;base64,UklGRiQBAABXRUJQVlA4IBgBAADwBQCdASoYABgAPt1kplAopSMiqAqpEBuJQBftXs9qCAVv0Qpl4uN9aLSOnO6eTdQ0AWyvQ6VfAAD4LsHQ83fa8UDIhMefcm8KqDXDqyO8JE8TmrxpSw0YwfABk0so1BI9QL82vHxg7NnNDzwdIt6e2FjQSYmD8+L4F87qFBdv6gknSbgarZ8DW9Y+8B4DSYJhzxuEBR15CQqkV60iiu3vOzomBV2fafuUS6Xp4ckqMJW83nbqw/DT/iUab2VHANcQksyX61E9Dpg0y2eAWITb9Sz31qB/uVc7na70jC/P0ZJYWY6liHgGR2suggeTbmLr2u8fc7vTPh2TFJ/RYJCM4BhYlSxcwZ1SbPSdu8inw35Rwo5kAAAA"
  },
  "/images/about-polaroids/development.jpg": {
    "src": "/images/about-polaroids/development.jpg",
    "width": 1024,
    "height": 1024,
    "blurDataURL": "data:image/webp;base64,UklGRhQBAABXRUJQVlA4IAgBAADQBQCdASoYABgAPt1mqlEopSOiqAgBEBuJagCdMt8lyQv4cZ7+0VqgpUUeRzB0vZ0WiOPeaE4AAP7Q/dksK2PPPIokWDmN6v3Xyw7guFkwH0e6vI0KvKX6c7kMyCO36vEWtae7T5IvlnXYSA/lTzbbvQThuDTxH9WY/+4WMA9SWMXOcWUO8xCB3Q02PZxo5jgpniidZ1BkCxUbOiBTLDMtuRa4W5hmiBh1nfkp/GwjeyWH7V1Ty5x0sJzRjpHqotZ0VHv3Jre+fYg4UXtOiXg37bmfB2hVnPBIj627DSCblvU0vFtjLamzmZYJo7v+GVBkJ51tg971aYor5U0KAoO39s62MikAAAA="
  },
  "/images/about-polaroids/education.jpg": {
    "src": "/images/about-polaroids/education.jpg",
    "width": 1024,
    "height": 1024,
    "blurDataURL": "data:image/webp;base64,UklGRhoBAABXRUJQVlA4IA4BAACwBQCdASoYABgAPt1mq1EopSOiqAgBEBuJQBOmZf3txnoKXq+c+K9CRR4qHjirWzu98ofJHgAA/tb0es8q2ONW/AsTF8ShXUmYEX7JM+M2xLDMgqGDhVT7IpSrmPnpz52PlcVpcy2mjaV82JhnuMuoiEYr6e1cE3xxJfirrdfUtYNgXDri2hnI9AwM+vluuNVdN2Rv7Pf4OS32/n50XtSyxgAlg97DS8+ck+88g/JCdASU+LdXFJxlkZ10LNeDr+3SIPluJDGWUHZGSTo7SLxu0SZpb5wg6C+PwjpaqiGkfIibHPF4AAnaWCmDvuED9jI439g/j9fjAWpRgmYzY3a6OsA+SJZAKtY3U9YAAAA="
  },
  "/images/about-polaroids/experiments.jpg": {
    "src": "/images/about-polaroids/experiments.jpg",
    "width": 1529,
    "height": 860,
    "blurDataURL": "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAABwBACdASoYAA0APt1cp00opSOiMAgBEBuJQBhQMYYbihI5oCJqEyJUMYmQAAD+9CqNwT1RiJwqVdY8dj+KbIY85V7nnHH3jMZh1EWKTG0sT420sJsuAS9bjoXWhAObL52LlDJugZf94GsVy83geRPOoYrbIA4kHSNo8AAA"
  },
  "/images/about-polaroids/future.jpg": {
    "src": "/images/about-polaroids/future.jpg",
    "width": 1024,
    "height": 1024,
    "blurDataURL": "data:image/webp;base64,UklGRrIAAABXRUJQVlA4IKYAAACwBQCdASoYABgAPt1UpUyopCOiN/VYARAbiWQAnTNY/KglugMw+ygwZeK5OC1WHpLujo8Oh4AA/rEyGMpyd7Z2d+BLF7xIpliSgdrcPi/W2C4fZmoG4KsYJl29pQf2qNFTq2vDQ739kv4zafuw7IJ9T8OFzAH8R24I7w+fOrFHokRqhvPrKA4/mkJ/jmLLQiw9MOc0Z1mnSy1LUi5K7YVJYGGDwAAA"
  },
  "/images/about-polaroids/growth.jpg": {
    "src": "/images/about-polaroids/growth.jpg",
    "width": 1024,
    "height": 1280,
    "blurDataURL": "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAACwBACdASoYAB4APt1mq1EopSOiqAgBEBuJYwAA7OZVYsHLMTVfk6epTEbky97AAP77o3q6N0iggfs1tpsiGjSeLCo8F2ELf7Y7D2m1o2hu6+P0qj3AhTzJJZaU1zC1e2zwquJrJolR9/lQ6JfdTc6jJbeY503VHKHJ4vRjZ1yk+hMok0loW8fd1B0M0GsAAAA="
  },
  "/images/about-polaroids/science.jpg": {
    "src": "/images/about-polaroids/science.jpg",
    "width": 1024,
    "height": 1024,
    "blurDataURL": "data:image/webp;base64,UklGRpQAAABXRUJQVlA4IIgAAABQBACdASoYABgAPt1WpUyopKOiN/VYARAbiWoAnS+B+gXoAUgfgwYN8n4QAP7uHr7lu+yUzz+ZjlTDjw/dCFCm8St14uqgvcNE3AIBAWzQeMHzBWoyhL/5wYY9FZHAKJDRYPlhZgKCvjaiezxenuMxxsaEM7jICujSO+bZkJVpIybSfeLM8gAA"
  },
  "/images/intro-polaroids/about.webp": {
    "src": "/images/intro-polaroids/about.webp",
    "width": 420,
    "height": 360,
    "blurDataURL": "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAAAwBACdASoYABUAPt1mqU+opaOiKAqpEBuJTMgIwsf8IWayBsX4U4p3GwAA/uawn3L9vorsuq8irQQUGYH13S20hjI1QZuQ9SKCXVUxGQXHg6NDUuMRVrjQAVlSxknA4VrPG3B/n3u2ReW9kv88AQRwDxJ/AAAA"
  },
  "/images/intro-polaroids/contact.webp": {
    "src": "/images/intro-polaroids/contact.webp",
    "width": 420,
    "height": 360,
    "blurDataURL": "data:image/webp;base64,UklGRgYBAABXRUJQVlA4IPoAAACQBQCdASoYABUAPt1mrFCopSQiqAgBEBuJaACdMt7BSdC4ZoUcaLKQdX8d3eeTVOk7umoRQAD+3OAwrTyVLnKqUvSOrOpTmUeiw+vyp7hU61wZ6h9ZYmCySYeMzBkesByF7dZoYVzGYFd7VJkgHoL+TGliC4ZvLAJeljimyxsO9kL9DFV22El0Eg/wz0ekxg4NYI6VWV1u0JoaCMk2ZT4FfIOuLdiY9xOedvqoHFuooxtA90OnhwkRLCupwhXKTKT/LrhGQ7dQ8WmDltZA5u0P532N2E3KSKhDHTezJmEDPOr2y42jeu3rv5kCHcLVWmR/Zx4ZSsumwAAA"
  },
  "/images/intro-polaroids/experience.webp": {
    "src": "/images/intro-polaroids/experience.webp",
    "width": 420,
    "height": 360,
    "blurDataURL": "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBQCdASoYABUAPt1gqE6opSOiMBgIARAbiWQAnTLQwaoBfEjfxjwxcuOWURD4NO8xx8AA/u/G7vI0irnJj/xGRYcK4w5C/2kG42ukLIvrP4dVoWvu3TMwII9Et8SKMCG/J3T1BH2Bdtqcox/wZKLOC0Lr/j/p5nBoderRKWqEM8RdzdX9jT7zuCZyy23gNlegDvUxsJ4L8AAA"
  },
  "/images/intro-polaroids/projects.webp": {
    "src": "/images/intro-polaroids/projects.webp",
    "width": 420,
    "height": 360,
    "blurDataURL": "data:image/webp;base64,UklGRtQAAABXRUJQVlA4IMgAAACQBQCdASoYABUAPt1cqE6opKOiMBgIARAbiWwAnSCAgZn/kPU4clipx0t0zmULbMxBeJtIAAD+xVvxD+b2TBqpeTFriizPZ+nHjx8j8z2zYyREY3bAzPkpKgM/YuNZq9gcDKAuV6d6NjsIvavdFeOptSN98/byGyozLkDm1/PHSq96+g3+fIgf78AmXGAkd+4/o9d849RfL631f2dgyt7CNLpJe04XyZlqB2YaFCmjhR7ImhhmLAKUFL8E0NF2sP+cfVUx1wjAAA=="
  },
  "/images/joelson-portrait.png": {
    "src": "/images/joelson-portrait.webp",
    "width": 1174,
    "height": 1339,
    "blurDataURL": "data:image/webp;base64,UklGRnwBAABXRUJQVlA4WAoAAAAQAAAAFwAAGgAAQUxQSK4AAAABgKttmzFn1vZuu6U7xaxtH4HNc7BxGDbLTclSXTalk/m6f96JDiAiJoCJ1a5YwMjkLVmpNPGLNr9ZpvWLFG97VVjimYRvNdgEgZ2Q+hIZh2wc2Yb078gaxK6QFcixicx4kC6CG5ECLIp4oA8dwg4+gW2Gn4kumOSgaEzG8aXE7TLsSaCVUT8qkU9CO0HCoxiUc04g3y7RKHlXOUk+zFfombYtTd+ZKr6hb+b0XwJWUDggqAAAAFAFAJ0BKhgAGwA+2VagTKgkoyIwDAEAGwlpAAgZLpKb7aKCVums5F59/oYcr1FTpHO4AAD+y9BtvGwz98/YBKjMrV7y9MadoLMPTYVEgLpo6cIVYQd3Nhw0xRz1xv9yJ5h9VmJcGMF2ZllmPHcUxYgVF+HjZ2JZM5H4Lz43+XRXP7iJp3jAVgtLSBq7qtg0TeRPjpUVof+pGUzvVka0FOOw9sZ+1FAAAA=="
  }
};
