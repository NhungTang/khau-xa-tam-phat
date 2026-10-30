// Các bài kinh / kệ (bản phiên âm Hán Việt truyền thống). Mỗi ngày xoay vòng một bài.
window.SUTRAS = [
  {
    title: 'Kệ Khai Kinh',
    text:
      'Vô thượng thâm thâm vi diệu pháp,\n' +
      'Bách thiên vạn kiếp nan tao ngộ,\n' +
      'Ngã kim kiến văn đắc thọ trì,\n' +
      'Nguyện giải Như Lai chân thật nghĩa.',
  },
  {
    title: 'Thất Phật Thông Giới Kệ',
    text:
      'Chư ác mạc tác,\n' +
      'Chúng thiện phụng hành,\n' +
      'Tự tịnh kỳ ý,\n' +
      'Thị chư Phật giáo.',
  },
  {
    title: 'Tứ Hoằng Thệ Nguyện',
    text:
      'Chúng sanh vô biên thệ nguyện độ,\n' +
      'Phiền não vô tận thệ nguyện đoạn,\n' +
      'Pháp môn vô lượng thệ nguyện học,\n' +
      'Phật đạo vô thượng thệ nguyện thành.',
  },
  {
    title: 'Kệ Sám Hối',
    text:
      'Vãng tích sở tạo chư ác nghiệp,\n' +
      'Giai do vô thủy tham sân si,\n' +
      'Tùng thân ngữ ý chi sở sanh,\n' +
      'Nhất thiết ngã kim giai sám hối.',
  },
  {
    title: 'Tam Tự Quy Y',
    text:
      'Tự quy y Phật, đương nguyện chúng sanh, thể giải đại đạo, phát vô thượng tâm.\n' +
      'Tự quy y Pháp, đương nguyện chúng sanh, thâm nhập kinh tạng, trí tuệ như hải.\n' +
      'Tự quy y Tăng, đương nguyện chúng sanh, thống lý đại chúng, nhất thiết vô ngại.',
  },
  {
    title: 'Kệ Tán Phật A Di Đà',
    text:
      'A Di Đà Phật thân kim sắc,\n' +
      'Tướng hảo quang minh vô đẳng luân,\n' +
      'Bạch hào uyển chuyển ngũ Tu Di,\n' +
      'Cám mục trừng thanh tứ đại hải.\n' +
      'Quang trung hóa Phật vô số ức,\n' +
      'Hóa Bồ Tát chúng diệc vô biên,\n' +
      'Tứ thập bát nguyện độ chúng sanh,\n' +
      'Cửu phẩm hàm linh đăng bỉ ngạn.',
  },
  {
    title: 'Bát Nhã Ba La Mật Đa Tâm Kinh',
    text:
      'Quán Tự Tại Bồ Tát hành thâm Bát Nhã Ba La Mật Đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.\n' +
      'Xá Lợi Tử, sắc bất dị không, không bất dị sắc, sắc tức thị không, không tức thị sắc, thọ tưởng hành thức diệc phục như thị.\n' +
      'Xá Lợi Tử, thị chư pháp không tướng, bất sanh bất diệt, bất cấu bất tịnh, bất tăng bất giảm.\n' +
      'Thị cố không trung vô sắc, vô thọ tưởng hành thức, vô nhãn nhĩ tỷ thiệt thân ý, vô sắc thanh hương vị xúc pháp, vô nhãn giới nãi chí vô ý thức giới, vô vô minh diệc vô vô minh tận, nãi chí vô lão tử, diệc vô lão tử tận, vô khổ tập diệt đạo, vô trí diệc vô đắc, dĩ vô sở đắc cố.\n' +
      'Bồ Đề Tát Đỏa y Bát Nhã Ba La Mật Đa cố, tâm vô quái ngại, vô quái ngại cố, vô hữu khủng bố, viễn ly điên đảo mộng tưởng, cứu cánh Niết Bàn.\n' +
      'Tam thế chư Phật y Bát Nhã Ba La Mật Đa cố, đắc A Nậu Đa La Tam Miệu Tam Bồ Đề.\n' +
      'Cố tri Bát Nhã Ba La Mật Đa, thị đại thần chú, thị đại minh chú, thị vô thượng chú, thị vô đẳng đẳng chú, năng trừ nhất thiết khổ, chân thật bất hư.\n' +
      'Cố thuyết Bát Nhã Ba La Mật Đa chú, tức thuyết chú viết:\n' +
      'Yết đế yết đế, ba la yết đế, ba la tăng yết đế, Bồ đề tát bà ha.',
  },
  {
    title: 'Kệ Hồi Hướng',
    text:
      'Nguyện dĩ thử công đức,\n' +
      'Phổ cập ư nhất thiết,\n' +
      'Ngã đẳng dữ chúng sanh,\n' +
      'Giai cộng thành Phật đạo.',
  },
  // Kinh Dược Sư Lưu Ly Quang Như Lai Bổn Nguyện Công Đức — bản dịch Sa Môn Thích Huyền Dung
  // (nguồn: niemphat.vn). Chia thành nhiều phần để chép; chỉ sửa lỗi gõ/mã hoá chữ của bản PDF.
  {
    title: "Kinh Dược Sư — phần 1/32",
    text: "Ta nghe như vầy: Một thuở nọ, đức Bạt Già Phạm đi châu du giáo hóa các nước, đến thành Quảng Nghiêm, ở nghỉ dưới cây Nhạc Âm cùng với tám ngàn vị Đại Bí Sô, ba vạn sáu ngàn vị Đại Bồ Tát, các hàng Quốc Vương, đại thần, bà la môn, các hàng cư sĩ, thiên long bát bộ cùng nhơn, phi nhơn, cả thảy đại chúng nhiều vô lượng, đồng vây quanh Phật cung kính thỉnh Ngài thuyết pháp.",
  },
  {
    title: "Kinh Dược Sư — phần 2/32",
    text: "Lúc bấy giờ, ông Mạn Thù Thất Lợi pháp vương tử nhờ oai thần của Phật, từ chỗ ngồi đứng dậy, vén y để bày vai bên hữu và gối bên mặt quỳ sát đất, khép nép chắp tay hướng về phía Phật bạch rằng: \"Bạch Đức Thế Tôn, cúi mong Ngài nói rõ những danh hiệu, những bổn nguyện rộng lớn cùng những công đức thù thắng của chư Phật để cho những người đang nghe pháp, nghiệp chướng tiêu trừ và để cho chúng hữu tình ở đời tượng pháp được nhiều lợi lạc về sau. Đức Thế Tôn khen ông Mạn Thù Thất Lợi đồng tử rằng: \"Hay thay! Hay thay! Mạn Thù Thất Lợi! Ngươi lấy lòng đại bi yêu cầu Ta nói những danh hiệu và bổn nguyện công đức của chư Phật là vì muốn cho chúng hữu tình khỏi bị nghiệp chướng ràng buộc, lợi ích an vui, trong đời tượng pháp về sau. Nay ngươi nên lóng nghe và suy nghĩ kỹ, Ta sẽ vì ông mà nói\". Ông Mạn Thù Thất Lợi bạch rằng: \"Dạ, mong Thế Tôn nói, chúng con xin nghe\". Phật bảo ông Mạn Thù Thất Lợi: \"Ở phương Đông, cách đây hơn mười căn dà sa cõi Phật có một thế giới tên là Tịnh Lưu Ly. Đức giáo chủ cõi ấy hiệu là Dược Sư Lưu Ly Quang Như Lai Ứng Chánh Đẳng Giác, Minh hạnh viên mãn, Thiện thệ, Thế gian giải, Vô thượng sĩ, Điều ngự trượng phu, Thiên nhơn sư, Phật Bạc Già Phạm.",
  },
  {
    title: "Kinh Dược Sư — phần 3/32",
    text: "Này Mạn Thù Thất Lợi, đức Dược Sư Lưu Ly Quang Như Lai, khi còn tu hạnh đạo Bồ tát có phát mười hai nguyện lớn, khiến cho chúng hữu tình cầu chi được nấy.\nNguyện thứ nhất: Ta nguyện đời sau, khi chứng đặng đạo chánh đẳng chánh giác, thân ta có hào quang sáng suốt, rực rỡ chiếu khắp vô lượng, vô số, vô biên thế giới, khiến cho tất cả chúng hữu tình đều có đủ ba mươi hai tướng đại trượng phu, cùng tám chục món tùy hình trang nghiêm như thân của ta vậy.\nNguyện thứ hai: Ta nguyện đời sau, khi đặng đạo Bồ đề, thân ta như ngọc lưu ly, trong ngoài sáng suốt, tinh sạch hoàn toàn, không có chút nhơ bợn, ánh quang minh chói lọi khắp nơi, công đức cao vòi vọi và an trú giữa từng lưới dệt bằng tia sáng, tỏ hơn vừng nhựt nguyệt. Chúng sanh trong cõi u minh đều nhờ ánh sáng ấy mà tâm trí được mở mang và tùy ý muốn đi đến chỗ nào để làm các sự nghiệp gì cũng đều được cả.",
  },
  {
    title: "Kinh Dược Sư — phần 4/32",
    text: "Nguyện thứ ba: Ta nguyện đời sau, khi đặng đạo Bồ đề, dùng trí huệ phương tiện vô lượng vô biên độ cho chúng hữu tình, khiến ai nấy đều có đủ các vật dụng, chớ không cho ai phải chịu sự thiếu thốn.\nNguyện thứ tư: Ta nguyện đời sau, khi đặng đạo Bồ đề, nếu có chúng hữu tình tu theo tà đạo, thì ta khiến họ quay về an trụ trong đạo Bồ đề, hoặc có những người tu hành theo hạnh Thinh văn, Độc giác, thì ta cũng lấy phép đại thừa mà dạy bảo cho họ.\nNguyện thứ năm: Ta nguyện đời sau, khi đặng đạo Bồ đề, nếu có chúng hữu tình nhiều vô lượng, vô biên ở trong giáo pháp của ta mà tu hành theo hạnh thanh tịnh thì ta khiến cho tất cả đều giữ được giới pháp hoàn toàn đầy đủ cả tam tụ tịnh giới. Giả sử có người nào bị tội hủy phạm giới pháp mà khi đã nghe được danh hiệu ta thì trở lại được thanh tịnh, khỏi sa vào đường ác.",
  },
  {
    title: "Kinh Dược Sư — phần 5/32",
    text: "Nguyện thứ sáu: Ta nguyện đời sau, khi chứng được đạo Bồ đề, nếu có chúng hữu tình nào thân hình hèn hạ, các căn không đủ, xấu xa, khờ khạo, tai điếc, mắt đui, nói năng ngọng liệu, tay chân tật nguyền, lát hủi, điên cuồng, chịu tất cả những bệnh khổ ấy mà khi đã nghe danh hiệu ta thì liền được thân hình đoan chánh, tâm tánh khôn ngoan, các căn đầy đủ, không còn những bịnh khổ ấy nữa.\nNguyện thứ bảy: Ta nguyện đời sau, khi chứng được đạo Bồ đề, nếu có chúng hữu tình nào bị những chứng bịnh hiểm nghèo không ai cứu chữa, không ai để nương nhờ, không gặp thầy, không gặp thuốc, không bà con, không nhà cửa, chịu nhiều nỗi nghèo hèn khốn khổ, mà hễ danh hiệu ta đã nghe lọt vào tai một lần thì tất cả bệnh hoạn khổ não đều tiêu trừ, thân tâm an lạc, gia quyến sum vầy, của cải sung túc, cho đến chứng được đạo quả vô thượng Bồ đề.",
  },
  {
    title: "Kinh Dược Sư — phần 6/32",
    text: "Nguyện thứ tám: Ta nguyện đời sau, khi chứng được đạo Bồ đề, nếu có những phụ nữ nào bị trăm điều hèn hạ khổ sở của thân gái làm cho buồn rầu, bực tức, sanh tâm nhàm chán, muốn bỏ thân ấy, mà hễ nghe danh hiệu ta rồi thì tất cả đều được chuyển thân gái thành thân trai, có đủ hình tướng trượng phu, cho đến chứng được đạo quả vô thượng Bồ đề.\nNguyện thứ chín: Ta nguyện đời sau, khi chứng được đạo Bồ đề, thì khiến cho chúng hữu tình ra khỏi vòng lưới ma nghiệp, được giải thoát tất cả sự ràng buộc của ngoại đạo. Nếu có những kẻ sa vào rừng ác kiến, ta nhiếp dẫn họ trở về với chánh kiến và dần dần họ tu tập theo các hạnh Bồ tát đặng mau chứng đạo chánh đẳng Bồ đề.",
  },
  {
    title: "Kinh Dược Sư — phần 7/32",
    text: "Nguyện thứ mười: Ta nguyện đời sau, khi chứng được đạo Bồ đề, nếu có chúng hữu tình nào mà pháp luật nhà Vua gia tội phải bị xiềng xích, đánh đập, hoặc bị giam giữ trong chốn lao tù, hoặc bị chém giết, hoặc bị nhiều tai nạn nhục nhã, thân tâm chịu những nỗi khổ, buồn rầu, bức rức, hễ nghe đến danh hiệu ta, thì nhờ sức oai thần phước đức của ta đều được giải thoát tất cả những nỗi ưu khổ ấy.\nNguyện thứ mười một: Ta nguyện đời sau, khi chứng được đạo Bồ đề, nếu có chúng hữu tình nào bị sự đói khát hoành hành, đến nỗi vì tạo miếng ăn phải tạo các nghiệp dữ, mà hễ nghe danh hiệu ta rồi chuyên niệm thọ trì thì trước hết ta dùng các món ăn uống ngon lạ ban bố cho thân họ được no đủ và sau ta mới đem pháp vị nhiệm mầu kiến lập cho họ cái cảnh giới an lạc hoàn toàn.",
  },
  {
    title: "Kinh Dược Sư — phần 8/32",
    text: "Nguyện thứ mười hai: Ta nguyện đời sau, khi chứng được đạo Bồ đề, nếu có chúng hữu tình nào nghèo đến nỗi không có áo che thân bị muỗi mòng cắn đốt, nóng lạnh giải dầu, ngày đêm khổ bức, hễ nghe đến danh hiệu ta mà chuyên niệm thọ trì thì ta khiến cho được như ý muốn: nào các thứ y phục tốt đẹp, nào tất các bảo vật trang nghiêm, nào tràng hoa, phấn sáp bát ngát mùi thơm và trống nhạc cùng những điệu ca múa tùy tâm muốn thưởng thức món nào cũng được thỏa mãn cả.\nNày Mạn Thù Thất Lợi, đó là mười hai lời nguyện nhiệm mầu của đức Dược Sư Lưu Ly Quang Như Lai Ứng Chánh Đẳng Chánh Giác phát ra trong khi tu hạnh đạo Bồ tát.\nLại nữa, Mạn Thù Thất Lợi, đức Dược Sư Lưu Ly Quang Như Lai kia khi còn tu hành đạo Bồ tát phát những lời nguyện rộng lớn và những công đức trang nghiêm ở cõi Ngài, dầu ta nói mãn một kiếp hay hơn một kiếp cũng không thể nào hết được. Nhưng ta có thể nói ngay rằng cõi Phật kia một bề thanh tịnh không có đàn bà, cũng không có đường dữ và cả đến tiếng khổ cũng không.",
  },
  {
    title: "Kinh Dược Sư — phần 9/32",
    text: "Ở cõi ấy đất toàn bằng chất lưu ly, đường đi có dây bằng vàng giăng làm ranh giới, còn thành quách cung điện, mái hiên cửa sổ cho đến các lớp lưới bao phủ cũng toàn bằng đồ thất bảo làm ra. Thật chẳng khác gì những công đức trang nghiêm ở cõi Tây Phương Cực Lạc vậy.\nCõi Phật ấy có hai vị đại Bồ tát là Nhựt Quang biến chiếu, và Nguyệt Quang biến chiếu, chính là hai bực thượng thủ trong vô lượng, vô số Bồ tát và lại là những bậc sắp bổ xứ làm Phật. Hai vị này đều giữ gìn kho báu chánh pháp của Phật Dược Sư Lưu Ly Quang Như Lai.\nMạn Thù Thất Lợi, vì thế những kẻ thiện nam tín nữ nào có lòng tin vững chắc thì nên nguyện sanh về thế giới của Ngài.",
  },
  {
    title: "Kinh Dược Sư — phần 10/32",
    text: "Lúc ấy Đức Thế Tôn lại bảo ông Mạn Thù Thất Lợi đồng tử rằng: \"Có những chúng sanh không biết điều lành dữ, cứ ôm lòng bỏn xẻn tham lam, không biết bố thí mà cũng không biết quả báo của sự bố thí là gì, ngu si vô trí, thiếu hẳn đức tin, lại ham chứa chất của cải cho nhiều, đêm ngày bo-bo gìn giữ, thấy ai đến xin, lòng đã không muốn, nhưng nếu cực chẳng đã phải đưa của ra thì đau đớn mến tiếc, dường như lóc thịt cho người vậy. Lại có vô lượng chúng hữu tình tham lẫn, chỉ lo tích trữ của cải cho nhiều mà tự mình không dám ăn tiêu, còn nói chi đến sự đem của ấy thí cho cha mẹ, vợ con, tôi tớ và những kẻ nghèo hèn đến xin. Những kẽ tham lẫn ấy, khi chết bị đọa vào đường ngạ quỷ hay bàng sanh. Mặc dầu ở trong ác thú, nhưng nhờ đời trước, sống trong cõi nhơn gian đã từng nghe qua danh hiệu của đức Dược Sư Lưu Ly Quang Như Lai, mà nay lại còn nhớ niệm đến danh hiệu Ngài thì liền từ cõi ấy thoát sanh trở lại làm người. Khi đã được làm người lại nhớ đến kiếp sống trong đường ngạ quỷ súc sanh, biết sợ sự đau khổ nên không ưa đắm dục lạc mà còn muốn tự mình làm việc bố thí, không tham tiếc món gì và lần lần có thể đem cả đầu, mắt, tay chân hay máu thịt của thân phần mình mà bố thí cho những kẻ đến xin cũng được, huống chi của cải là những vật thừa.",
  },
  {
    title: "Kinh Dược Sư — phần 11/32",
    text: "Lại nữa, Mạn Thù Thất Lợi, trong chúng hữu tình nếu có những người nào thọ các giới của Phật để tu học mà lại phá giới hoặc có kẻ không phá giới mà lại phá phép tắc, hoặc có kẻ tuy chẳng phá giới và phép tắc mà lại hủy hoại chánh kiến, hoặc có kẻ tuy không hủy hoại chánh kiến mà lại bỏ sự đa văn nên không hiểu được nghĩa lý sâu xa trong kinh Phật nói, hoặc có kẻ tuy đa văn mà có thói tăng thượng mạn ấy che lấp tâm tánh, cố chấp cho mình là phải, người khác là quấy, chê bai chánh pháp, kết đảng với ma. Những kẻ ngu si ấy tự mình đã làm theo tà kiến mà lại còn khiến cho vô số ức triệu chúng hữu tình cũng bị sa vào hố nguy hiểm. Những chúng hữu tình ấy bị trôi lăn trong các đường địa ngục, ngạ-quỷ bàng sanh không khi nào cùng. Nhưng nếu nghe được danh hiệu của đức Dược Sư Lưu Ly Quang Như Lai thì họ liền bỏ những hạnh dữ tu theo các pháp lành, khỏi bị đọa vào vòng ác thú nữa. Giả sử có người không thể bỏ những hạnh dữ và không tu theo những pháp lành mà phải bị đọa vào trong ác thú thì cũng nhờ oai lực bổn nguyện của đức Dược Sư khiến cho họ, khi tạm nghe được danh hiệu Ngài, liền từ nơi ác thú mạng chung, trở sanh vào cõi người, được tinh tấn tu hành trong sự hiểu biết chơn chánh khéo điều hòa tâm ý, bỏ tục xuất gia thọ trì và tu học theo giáo pháp của Như Lai, đã không hủy phạm lại thêm chánh kiến đa văn, hiểu rõ nghĩa lý sâu xa lìa được thói tăng thượng mạn, không chê bai chánh pháp, không bè bạn với ma, dần dần tu hành theo hạnh Bồ tát chóng được viên mãn.",
  },
  {
    title: "Kinh Dược Sư — phần 12/32",
    text: "Lại nữa, Mạn Thù Thất Lợi, nếu chúng hữu tình có tánh tham lam tật đố, hay khen mình chê người thì sẽ bị đọa địa ngục, ngạ quỉ, súc sanh, phải chịu nhiều sự đau đớn khổ sở, trải qua không biết mấy nghìn năm mới hết. Khi đã mãn sự đau khổ kia, liền từ nơi đó mạng chung sanh lại cõi người phải làm thân trâu, ngựa, lừa, lạc đà, thường bị người hành hạ, đánh đập và bị đói khát dày vò, lại phải đi đường xa chở nặng, cực nhọc muôn phần; còn như may đặng làm thân người thì lại bị sanh vào hạng hạ tiện phải làm tôi tớ cho kẻ khác, mãi bị họ sai sử không khi nào được chút thong thả tự do. Nếu những nhơn, vật ấy đời trước khi còn trong nhơn đạo đã từng nghe danh hiệu của đức Dược Sư Lưu Ly Quang Như Lai thì do cái nhơn lành ấy, ngày nay nhớ lại, chí tâm quy y Ngài, nhờ thần lực của Ngài gia bị mà thoát khỏi mọi sự khổ não, các căn thông lợi, trí huệ sáng suốt lại thêm đa văn, hằng cầu thắng pháp, thường gặp bạn lành, đời đời dứt hẳn lưới ma, đập nát vỏ vô minh, tát cạn sông phiền não, mà được giải thoát khỏi nạn sanh, lão, bệnh, tử và những nổi đau khổ lo buồn.",
  },
  {
    title: "Kinh Dược Sư — phần 13/32",
    text: "Lại nữa, Mạn Thù Thất Lợi, nếu chúng hữu tình có tánh ưa sự ương ngang trái chia lìa, tranh đấu, kiện cáo lẫn nhau, làm não loạn cho mình và người, đem thân, khẩu, ý tạo thêm mãi những ác nghiệp, xoay qua trở lại, thường làm những việc không nhiêu ích để mưu hại lẫn nhau, hoặc cáo triệu những thần ở núi rừng, cây, mã, để hại người, hoặc giết chúng sanh lấy huyết thịt cúng tế quỷ Dược xoa và quỷ La sát để cậy quỷ hại người, hoặc biên tên họ và làm hình tượng của người cừu oán rồi dùng phép chú thuật tà ác mà trù ẻo cho chết, hoặc theo lối ếm đối và dùng những đồ độc, hoặc dùng chú pháp hại mạng người. Nếu chúng hữu tình bị những tai nạn ấy mà nghe danh hiệu của đức Dược Sư Lưu Ly Quang Như Lai thì các thứ tà ác kia không thể hại được. Tất cả những kẻ ác tâm kia đều trở lại khởi lòng từ làm việc lợi ích an vui cho kẻ khác, không còn ý tổn não vào tâm hiềm giận, hai bên hòa hảo với nhau. Và đối với vật thọ dụng của ai thì người ấy tự vui mừng biết đủ, không xâm lấn của nhau mà lại còn giúp đỡ lẫn nhau nữa.",
  },
  {
    title: "Kinh Dược Sư — phần 14/32",
    text: "Lại nữa, Mạn Thù Thất Lợi, nếu trong hàng tứ chúng: bí sô, bí sô ni, ô ba sách ca, ô ba tư ca, và những kẻ thiện nam, tín nữ đều có thọ trì tám phần trai giới, hoặc trong một năm, hoặc mỗi năm ba tháng, vâng giữ giới pháp, làm nơi y chỉ tu học rồi đem căn lành này nguyện sanh về chỗ Phật Vô lượng thọ ở thế giới Cực Lạc Tây Phương đặng nghe chánh pháp, nhưng nếu chưa quyết định, mà nghe được danh hiệu đức Dược Sư Lưu Ly Quang Như Lai, thì khi mạng chung sẽ có tám vị Đại Bồ tát như: Văn Thù Sư Lợi Bồ tát, Quán Thế Âm Bồ tát, Đắc Đại Thế Bồ tát, Bảo Đàn Hoa Bồ tát, Vô Tận Ý Bồ tát, Dược Vương Bồ tát, Dược Thượng Bồ tát, Di Lặc Bồ tát từ trên không trung đi đến đưa đường chỉ lối cho thì liền được vãng sanh trong những hoa báu đủ màu. Hoặc nếu có kẻ, nhơn nguyện lực của đức Dược Sư mà được thoát sanh lên cõi Trời và mặc dầu sanh lên cõi Trời nhưng nhờ cái căn lành sẵn có ấy chưa hết thì không còn sanh lại những đường ác nữa. Khi tuổi thọ ở cõi Trời đã mãn, sanh lại trong cõi người thì, hoặc làm đến bậc Luân vương, thống nhiếp cả bốn châu thiên hạ, oai đức tự tại, giáo hóa cho vô lượng trăm ngàn chúng hữu tình theo con đường thập thiện, hoặc sanh vào giòng Sát đế lỵ, Bà la môn hay cư sĩ đại gia, của tiền dư dật, kho đụn tràn đầy, tướng mạo đoan trang, quyến thuộc sum vầy, lại được thông minh trí huệ, dõng mãnh oai hùng như người đại lực sĩ. Còn nếu có người phụ nữ nào nghe đến danh hiệu của đức Dược Sư Lưu Ly Quang Như Lai mà hết lòng thọ trì danh hiệu ấy thì đời sau sẽ không làm thân gái nữa.",
  },
  {
    title: "Kinh Dược Sư — phần 15/32",
    text: "Này Mạn Thù Thất Lợi! Đức Dược Sư Lưu Ly Quang Như Lai kia khi đã chứng được đạo Bồ đề, do sức bổn nguyện mà Ngài quan sát biết chúng hữu tình gặp phải các thứ bịnh khổ như da vàng, gầy ốm, cảm nhiệt, thương hàn, hoặc trúng phải những thứ ếm đối, đồ độc, hoặc bị hoạnh tử, hoặc bị chết non. Muốn những chứng bệnh đau khổ ấy được tiêu trừ và lòng mong cầu của chúng hữu tình được mãn nguyện, Ngài liền nhập định, kêu là định: \"diệt trừ tất cả khổ não chúng sanh\". Khi Ngài nhập định, từ trong nhục kế phóng ra luồng ánh sáng lớn, trong luồng ánh sáng ấy nói chú đại đà la ni:\nNam mô bạc già phạt đế, bệ sát xã, lu lô thích lưu ly, bác lặc bà, hát ra xà dã. Đát tha yết đa ra, a ra hắc đế. Tam miệu tam bột đà da, đát điệt tha. Án, bệ sát thệ, bệ sát thệ, bệ sát xã, tam một yết đế tóa ha.\nLúc ấy trong luồng ánh sáng diễn chú này rồi, cả đại địa rúng động, phóng ra ánh đại quang minh làm cho tất cả chúng sanh dứt hết bịnh khổ, hưởng được an vui.",
  },
  {
    title: "Kinh Dược Sư — phần 16/32",
    text: "Này Mạn Thù Thất Lợi! Nếu thấy những người nào đang mắc bịnh khổ thì phải tắm gội cho sạch sẽ và vì họ nhứt tâm tụng chú này 108 biến, chú nguyện trong đồ ăn, trong thuốc uống hay trong nước không vi trùng mà cho họ uống thì những bịnh khổ ấy đều tiêu diệt.\nNếu có ai mong cầu việc gì mà chí tâm tụng niệm chú này thì đều được như ý muốn: Đã không bịnh lại thêm sống lâu, sau khi mạng chung được sanh về thế giới Tịnh Lưu Ly, không còn thối chuyển, rồi dần dần tu chứng đến đạo quả Bồ đề.\nVậy nên, Mạn Thù Thất Lợi, nếu có những người nào hết lòng ân cần tôn trọng, cung kính cúng dường đức Dược Sư Lưu Ly Quang Như Lai thì phải thường trì tụng chú này đừng lãng quên.",
  },
  {
    title: "Kinh Dược Sư — phần 17/32",
    text: "Lại nữa, nếu có những kẻ tịnh tín nam nữ nào được nghe rồi tụng trì danh hiệu đức Dược Sư Lưu Ly Quang Như Lai, ưng chánh đẳng giác, mỗi sớm mai, súc miệng, đánh răng, tắm gội sạch sẽ, xong lại thắp hương, rải dầu thơm, các món kỹ nhạc để cúng dường hình tượng, còn đối với kinh điển này thì tự mình hay dạy người khác chép ra, rồi giữ một lòng thọ trì và suy nghĩ nghĩa lý; đối với vị pháp sư giảng nói kinh pháp thì phải nên cúng dường tất cả những vật cần dùng đừng để thiếu thốn. Hễ hết lòng như vậy thì nhờ chư Phật hộ niệm được mãn nguyện mọi sự mong cầu cho đến chứng đặng đạo quả bồ đề nữa.\nLúc bấy giờ Mạn Thù Thất Lợi đồng tử bạch Phật rằng: \"Bạch đức Thế Tôn, tôi thề qua thời kỳ tượng pháp sẽ dùng đủ chước phương tiện khiến cho những thiện nam tín nữ có lòng tin trong sạch được nghe danh hiệu của đức Dược Sư Lưu Ly Quang Như Lai, cả đến trong giấc ngủ của họ tôi cũng dùng danh hiệu của đức Phật này, thức tỉnh nơi tai cho họ rõ biết.",
  },
  {
    title: "Kinh Dược Sư — phần 18/32",
    text: "Bạch đức Thế Tôn, nếu ai thọ trì đọc tụng kinh này, hoặc đem giảng nói, bày tỏ cho người khác, hoặc tự mình hay dạy người biên chép kinh này, hết lòng cung kính tôn trọng, dùng những bông thơm, dầu thơm, các thứ hương đốt, tràng hoa, anh lạc, phướng lọng cùng âm nhạc hát múa mà cúng dường hoặc dùng hàng ngũ sắc làm đãy đựng kinh này, rồi quét dọn một nơi sạch sẽ, thiết lập một cái tòa cao mà để lên, thì lúc ấy có bốn vị thiên vương quyến thuộc và cùng vô lượng trăm ngàn thiên chúng ở các cõi Trời khác đều đến đó mà cúng dường và thủ hộ.\nBạch Đức Thế Tôn, nếu kinh này lưu hành đến chỗ nào có người thọ trì và nghe được danh hiệu của đức Dược Sư Lưu Ly Quang Như Lai thì nhờ công đức bổn nguyện của Ngài mà chỗ ấy không bị nạn hoạnh tử, cũng không bị những ác quỉ, ác thần đoạt lấy tinh khí, và dẫu có bị đoạt lấy đi nữa, cũng được huờn lại, thân tâm yên ổn khỏe mạnh như thường\".",
  },
  {
    title: "Kinh Dược Sư — phần 19/32",
    text: "Phật bảo Mạn Thù Thất Lợi: Phải phải, thiệt đúng như lời ngươi nói. Nầy Mạn Thù Thất Lợi! Nếu có những người tịnh tín thiện nam, tín nữ nào muốn cúng dường đức Dược Sư Lưu Ly Quang Như Lai thì trước phải tạo lập hình tượng Ngài, đem để trên tòa cao chưng dọn sạch sẽ các thứ rồi rãi bông, đốt các thứ hương, dùng các thứ tràng phan trang nghiêm chỗ thờ ấy trong bảy ngày bảy đêm, phải thọ tám phần trai giới, ăn đồ thanh trai, tắm gội và y phục chỉnh tề, giữ lòng thanh tịnh, không giận dữ, không sát hại đối với tất cả loài hữu tình phải khởi tâm bình đẳng, đủ cả tâm từ, bi, hỉ, xả làm cho họ được lợi ích an vui đánh nhạc ca hát ngơi khen và do phía hữu đi nhiễu quanh tượng Phật, lại phải nghĩ nhớ công đức bổn nguyện và đọc tụng kinh này, suy nghiệm nghĩa lý mà diễn nói khai thị cho người khác biết. Làm như vậy thì mong cầu việc chi cũng đều được toại ý, như cầu sống lâu, được sống lâu, cầu giàu sang, được giàu sang, cầu quan vị, được quan vị, cầu sanh con trai con gái thì sanh được con trai, con gái.",
  },
  {
    title: "Kinh Dược Sư — phần 20/32",
    text: "Lại nếu có người nào trong giấc ngủ thấy những điều chiêm bao dữ, còn khi thức thấy những ác tướng như chim đến đậu nơi vườn nhà, hoặc chỗ ở hiện ra trăm điều quái dị mà người ấy dùng những của báu cúng dường đức Phật Dược Sư Lưu Ly Quang Như Lai, thì những ác mộng, ác tướng và những điềm xấu ấy thảy đều ẩn hết, không còn phải lo sợ gì nữa.\nNếu gặp tai nạn nguy hiểm như nạn nước lửa, gươm, đao, thuốc độc và các cầm thú dữ gây sự sợ hãi như: voi, sư tử, cọp, sói, gấu, rắn độc, bò cạp, rít, sên, lằn muỗi, mà hết lòng nhớ niệm và cung kính cúng dường đức Phật Dược Sư Lưu Ly Quang Như Lai thì được thoát khỏi những sự sợ hãi ấy; hoặc nếu bị nước khác xâm lăng, nhiễu hại, trộm cướp rối loạn mà nhớ niệm và cung kính đức Phật Dược sư thì cũng được thoát khỏi những nạn ấy.",
  },
  {
    title: "Kinh Dược Sư — phần 21/32",
    text: "Lại nữa Mạn Thù Thất Lợi, nếu có thiện tín nữ nào từ khi phát tâm thọ giới cho đến ngày chết, không thờ những vị Trời nào, chỉ một lòng nương theo Phật, Pháp, Tăng, thọ trì giới cấm, hoặc 5 giới, 10 giới, Bồ tát 10 giới trọng, 48 giới khinh, Tỳ kheo 250 giới, Tỳ kheo ni 348 giới nếu có ai hủy phạm những giới pháp đã thọ sợ đọa vào ác thú, hễ chuyên niệm và cung kính cúng dường đức Phật Dược Sư thì quyết định không thọ sanh trong ba đường ác. Lại nếu có người phụ nữ nào đương lúc sanh sản phải chịu sự cực khổ đau đớn mà xưng danh hiệu, lễ bái và hết lòng cung kính cúng dường đức Phật Dược Sư thì khỏi những sự đau khổ ấy mà sanh con ra cũng được vuông tròn, tướng mạo đoan trang, lợi căn thông minh, an ổn ít bịnh hoạn, ai thấy cũng vui mừng và không bị quỉ cướp đoạt tinh khí.",
  },
  {
    title: "Kinh Dược Sư — phần 22/32",
    text: "Lúc ấy đức Thích Ca cũng bảo ông A Nan rằng: \"Theo như ta đã xưng dương những công đức của Phật Dược Sư Lưu Ly Quang Như Lai đó là công hạnh rất sâu xa của chư Phật, khó hiểu thấu được, vậy ngươi có tin chăng?\" Ông A Nan bạch Phật: \"Bạch đức Thế Tôn, đối với khế kinh của Như Lai nói không bao giờ tôi sanh tâm nghi hoặc. Tại sao? Vì những nghiệp thân, khẩu, ý của các đức Như Lai đều thanh tịnh. Bạch đức Thế Tôn, mặt trời mặt trăng có thể rơi xuống, núi Diệu cao có thể lay động, nhưng những lời của chư Phật nói ra không bao giờ sai được. Bạch Đức Thế Tôn, nếu có những chúng sanh nào tín căn không đầy đủ, nghe nói đến những công hạnh sâu xa của chư Phật thì nghĩ rằng: \"Làm sao chỉ niệm danh hiệu của một đức Dược Sư Lưu Ly Quang Như Lai mà được nhiều công đức thắng lợi ngần ấy?, vì sự không tin đó, trở sanh lòng hủy báng nên họ phải mất nhiều điều lợi ích, mãi ở trong cảnh đêm dài tăm tối và lại còn bị đọa lạc trong các đường ác thú, lưu chuyển không cùng\".",
  },
  {
    title: "Kinh Dược Sư — phần 23/32",
    text: "Phật lại bảo ông A Nan: \"Những chúng hữu tình ấy nếu nghe danh hiệu đức Dược Sư Lưu Ly Quang Như Lai, chí tâm thọ trì, không sanh lòng nghi hoặc mà đọa vào ác thú thì thật vô lý vậy.\nNày A Nan, đó là công hạnh rất sâu nhiệm của chư Phật, khó tin, khó hiểu mà nay ngươi lãnh thọ được thì biết rằng đó là nhờ oai lực của Như Lai vậy.\nNày A Nan, tất cả các hàng Thinh văn, Độc giác và các bậc Bồ Tát chưa lên đến bậc sơ địa đều không thể tin hiểu đúng như sự thật, chỉ trừ những bậc \"Nhứt sanh sở hệ Bồ Tát\" mới tin hiểu được mà thôi.\nNày A Nan, thân người khó đặng, nhưng hết lòng tin kính tôn trọng ngôi Tam bảo còn khó hơn, huống chi nghe được danh hiệu của đức Dược Sư Lưu Ly Quang Như Lai lại còn khó hơn nữa.",
  },
  {
    title: "Kinh Dược Sư — phần 24/32",
    text: "Này A Nan, đức Dược Sư Lưu Ly Quang Như Lai tu không biết bao nhiêu hạnh Bồ Tát, dùng không biết bao nhiêu phương tiện khéo léo, phát không biết bao nhiêu nguyện rộng lớn, nếu ta nói ra trong một kiếp hay hơn một kiếp thì kiếp số có thể mau hết, chớ những hạnh nguyện và những phương tiện khéo léo của đức Phật kia không khi nào nói cho hết được.\nLúc bấy giờ trong chúng hội có một vị đại Bồ tát tên là Cứu thoát liền từ chỗ ngồi đứng dậy, vén y để bày vai bên hữu, gối bên mặt quì sát đất cúi mình chắp tay bạch Phật rằng: \"Bạch Đức Thế Tôn, đến thời kỳ tượng pháp có những chúng sanh bị nhiều hoạn nạn, khốn khổ, tật bịnh luôn luôn, thân hình gầy ốm, ăn uống không được, môi cổ khô rang, mắt thấy đen tối, tướng chết hiện ra, cha mẹ, bà con, bè bạn quen biết vây quanh khóc lóc. Thân người bịnh vẫn còn nằm đó mà đã thấy sứ giả đến dẫn thần thức đem lại trước mặt vua Diêm Ma pháp vương, rồi liền khi ấy vị thần Cu sanh đem sổ ghi tội phước của người đó dưng lên vua Diêm Ma.",
  },
  {
    title: "Kinh Dược Sư — phần 25/32",
    text: "Lúc ấy vua phán hỏi rồi kê tính những tội phước của người kia đã làm mà xử đoán. Nếu trong lúc đó, những bà con quen biết, vì người bịnh ấy, qui y với đức Dược Sư Lưu Ly Quang Như Lai và thỉnh chúng tăng đọc tụng kinh nầy đốt đèn bảy từng, treo thần phang tục mạng năm sắc thì hoặc liền trong lúc ấy, hoặc trải qua bảy ngày, hai mươi mốt ngày, ba mươi lăm ngày, bốn mươi chín ngày, thần thức người kia được trở lại như vừa tỉnh giấc chiêm bao, tự mình nhớ biết những nghiệp lành, nghiệp dữ và sự quả báo đã thọ. Bởi chính đã rõ thấy nghiệp báo như vậy, nên dầu có gặp phải những tai nạn nguy hiểm đến tánh mạng cũng không dám tạo những nghiệp ác nữa. Vậy nên những tịnh tính thiện nam tín nữ đều phải một lòng thọ trì danh hiệu và tùy sức mình cung kính cúng dường đức Dược Sư Lưu Ly Quang Như Lai\".\nLúc bấy giờ ông A Nan hỏi Cứu Thoát Bồ Tát rằng: \"Nầy thiện nam tử, nên cung kính cúng dường đức Dược Sư Lưu Ly Quang Như Lai như thế nào? Còn đèn và phang tục mạng phải làm cách sao\".",
  },
  {
    title: "Kinh Dược Sư — phần 26/32",
    text: "Cứu Thoát Bồ Tát nói: \"Thưa Đại Đức, nếu có người bịnh nào, muốn khỏi bịnh khổ thì quyến thuộc họ phải thọ trì tám phần trai giới trong bảy ngày, bảy đêm tùy theo sức mình sắm sửa đồ ăn uống và các thứ cần dùng khác cúng dường chư tăng ngày đêm sáu thời, lễ bái cúng dường đức Dược Sư Lưu Ly Quang Như Lai, đọc tụng kinh nầy bốn mươi chín biến và thắp bốn mươi chín ngọn đèn, lại tạo bảy hình tượng đức Dược Sư trước mỗi hình tượng để bảy ngọn đèn, mỗi ngọn lớn như bánh xe, đốt luôn trong bốn mươi chín ngày đêm đừng cho tắt; còn cái thần phang thì làm bằng hàng ngũ sắc bề dài bốn mươi chín gang tay và phải phóng sanh bốn mươi chín thứ loài vật thì người bịnh ấy qua khỏi ách nạn, không còn bị hoạnh tử và bị các loài quỉ nhiễu hại.",
  },
  {
    title: "Kinh Dược Sư — phần 27/32",
    text: "Lại nữa, A Nan nếu trong giòng sát đế lỵ có những vị quốc vương đã làm lễ quán đảnh mà gặp lúc có nạn, nhân dân bị bịnh dịch, bị nước khác xâm lăng, bị nội loạn, hay bị nạn tinh tú biến ra nhiều điềm quái dị nạn nhựt thực, nguyệt thực, mưa gió trái mùa, hay bị nạn quá thời tiết không mưa, thì lúc ấy các vị quốc vương kia phải đem lòng từ bi thương xót tất cả chúng hữu tình, ân xá cho tội nhơn bị giam cầm, rồi y theo phép cúng dường đã nói trước mà cúng dường đức Dược Sư Lưu Ly Quang Như Lai thì do căn lành này và nhờ sức bổn nguyện của đức Dược Sư khiến trong nước liền được an ổn, mưa hòa gió thuận, lúa thóc được mùa, tất cả chúng hữu tình đều vui vẻ, không bịnh hoạn, không có thần Dược Xoa bạo ác, não hại lê dân. Tất cả ác tướng ấy đều ẩn mất và các vị quốc vương kia được sống lâu sức mạnh, không bịnh hoạn, mọi việc đều thêm lợi ích.",
  },
  {
    title: "Kinh Dược Sư — phần 28/32",
    text: "Nầy A Nan, nếu các hoàng hậu, hoàng phi, công chúa, thái tử, vương tử, đại thần phụ tướng, thể nữ trong cung, bá quan và thứ dân mà bị bịnh khổ cùng những ách nạn khác thì cũng nên tạo lập thần phang năm sắc, chong đèn sáng luôn, phóng sanh các loài vật, rãi hoa đủ sắc, đốt các thứ danh hương để cúng dường đức Phật Dược Sư, sẽ được lành bệnh và thoát khỏi các tai nạn.\nLúc ấy ông A Nan hỏi Cứu Thoát Bồ Tát rằng: \"Thiện nam tử, tại sao cái mạng đã hết mà còn sống thêm được\". Cứu Thoát Bồ tát nói: \"Nầy Đại đức, Đại đức há không nghe Như Lai nói có chín thứ hoạnh tử hay sao? Vậy nên ta khuyên người làm phang và đèn tục mạng, tu các phước đức và nhờ có tu các phước đức ấy nên suốt đời không bị khổ sở hoạn nạn\".",
  },
  {
    title: "Kinh Dược Sư — phần 29/32",
    text: "Ông A Nan hỏi: \"Chín thứ hoạnh tử là những thứ chi?\" Cứu Thoát Bồ tát trả lời: \"Một là nếu có chúng hữu tình nào bị bịnh tuy nhẹ, nhưng không thầy, không thuốc, không người săn sóc, hay giá có gặp thầy lại cho uống lầm thuốc, nên bịnh không đáng chết mà lại chết ngang. Lại đang lúc bịnh mà tin theo những thuyết họa phước vu vơ của bọn tà ma ngoại đạo, yêu nghiệt trong đời, sanh lòng rúng sợ không còn tự chủ đối với sự chân chánh, đi bói khoa để tìm hỏi mối họa rồi giết hại loài vật để tấu với thần minh, vái van cùng vọng lượng để cầu xin ban phước, mong được sống lâu, nhưng rốt cuộc không thể nào được. Bởi si mê lầm lạc, tin theo tà kiến điên đảo nên bị hoạnh tử, đọa vào địa ngục đời đời không ra khỏi. Hai là bị phép vua tru lục, ba là sa-đắm sự chơi bời, săn bắn, đam mê tửu sắc, buông lung vô độ, bị loài quỉ đoạt mất tinh khí, bốn là bị chết thiêu, năm là bị chết đắm, sáu là bị các thú dữ ăn thịt; bảy là bị sa từ trên núi cao xuống; tám là bị chết vì thuốc độc, êm đối, rủa nộp, trù ẻo và bị quỉ tủ thi làm hại; chín là bị đói khát khốn khổ mà chết.",
  },
  {
    title: "Kinh Dược Sư — phần 30/32",
    text: "Đó là chín thứ hoạnh tử của Như Lai nói. Còn những thứ hoạnh tử khác nhiều vô lượng không thể nói hết được.\nLại nữa, A Nan, Vua Diêm Ma kia là chủ lãnh ghi chép sổ bộ, tên tuổi tội phước trong thế gian. Nếu có chúng hữu tình nào ăn ở bất hiếu, ngũ nghịch, hủy nhục ngôi Tam Bảo, phá hoại phép vua tôi, hũy phạm điều cấm giới thì vua Diêm Ma pháp vương tùy tội nặng nhẹ mà hành phạt. Vì thế ta khuyên chúng hữu tình nên thắp đèn làm phang, phóng sanh, tu phước khiến khỏi được các khổ ách, khỏi gặp những tai nạn.\nLúc bấy giờ, trong hàng Đại chúng có mười hai vị Dược Xoa đại tướng đều ngồi trong hội như:\nCung tì La đại tướng.\nPhạt chiếc La đại tướng\nMê súy La đại tướng\nAn Để La đại tướng\nÁt Nể La đại tướng\nSan để La đại tướng\nNhơn Đạt La đại tướng\nBa di La đại tướng\nMa hổ La đại tướng\nChơn đạt La đại tướng\nChiêu đô La đại tướng\nTỳ yết La đại tướng",
  },
  {
    title: "Kinh Dược Sư — phần 31/32",
    text: "Mười hai vị đại tướng nầy mỗi vị đều có bảy ngàn Dược Xoa làm quyến thuộc đồng cất tiếng bạch Phật rằng: \"Bạch Đức Thế Tôn, hôm nay chúng tôi nhờ oai lực của Phật mà được nghe danh hiệu của đức Dược Sư Lưu Ly Quang Như Lai, không còn tâm sợ sệt trong các đường ác thú nữa. Chúng tôi cùng nhau, đồng một lòng trọn đời qui y Phật, Pháp, Tăng, thề sẽ gánh vác cho chúng hữu tình, làm việc nghĩa lợi đưa đến sự nhiêu ích an vui. Tùy nơi nào hoặc làng xóm, thành, nước, hoặc trong rừng cây vắng vẻ, nếu có kinh này lưu bố đến hay có người thọ trì danh hiệu đức Dược Sư Lưu Ly Quang Như Lai và cung kính cúng dường Ngài, thì chúng tôi cùng quyến thuộc đồng hộ vệ người ấy thoát khỏi tất cả ách nạn và khiến họ mong cầu việc chi cũng đều được thỏa mãn. Nếu có ai bịnh hoạn khổ ách, muốn cầu cho khỏi thì cũng nên đọc tụng kinh nầy và lấy chỉ ngũ sắc gút danh tự chúng tôi, khi đã được như lòng mong cầu thì mới mở gút ra\".",
  },
  {
    title: "Kinh Dược Sư — phần 32/32",
    text: "Lúc ấy đức Phật Thích Ca khen các vị Dược Xoa đại tướng rằng: \"Hay thay! Hay thay! Đại Dược Xoa tướng, các ngươi nghĩ muốn báo đáp ân đức của Phật Dược Sư Lưu Ly Quang nên mới phát nguyện làm những việc lợi ích an vui cho tất cả chúng hữu tình như vậy\".\nĐồng thời, ông A Nan lại bạch Phật rằng: \"Bạch Đức Thế Tôn, pháp môn nầy gọi là tên gì? Và chúng tôi phải phụng trì bằng cách nào?\".\nPhật bảo A Nan: \"pháp môn nầy gọi là Thuyết Dược Sư Lưu Ly Quang Như Lai bổn nguyện công đức, cũng gọi là thuyết Thập nhị thần tướng nhiêu ích hữu tình kiết nguyện thần chú và cũng gọi là Bạt trừ nhứt thế nghiệp chướng. Cứ nên đúng như vậy mà thọ trì\".\nKhi đức Bạt Già Phạm nói lời ấy rồi, các hàng Đại Bồ tát, các Đại Thinh Văn, cùng quốc vương, Đại thần, Bà la môn, Cư sĩ, Thiên, Long, Dược Xoa, Kiền thát bà, A tố lạc, Yết lộ Trà, Khẫn nại Lạc, Mạc hô lạc Dà, người cùng các loài quỉ thần, tất cả đại chúng, đều hết sức vui mừng và đồng tin chịu vưng làm.",
  },
  {
    title: "Dược Sư Quán Đỉnh Chân Ngôn",
    text: "Nam mô Bạc-già-phạt-đế, bệ sát xả lụ-rô, thích lưu-li, bát lạt bà, hắt ra xà\r giã, đát tha yết đa gia, a ra hát đế, tam miệu tam bột đà gia, đát điệt tha. Án\r bệ sát thệ, bệ sát thệ, bệ sát xã, tam một yết đế tóa ha.",
  },
];
