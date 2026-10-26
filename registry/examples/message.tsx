import { Check, CheckCheck } from "lucide-react";

import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message";

export function Site() {
  return (
    <MessageGroup className="mx-auto w-full max-w-lg">
      <Message>
        <MessageAvatar>AL</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Ana Lopez <time dateTime="2026-10-24T14:02">2:02 PM</time>
          </MessageHeader>
          <Bubble variant="secondary">
            <BubbleContent>Does Context.dev respect robots.txt?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>CD</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Context.dev <time dateTime="2026-10-24T14:03">2:03 PM</time>
          </MessageHeader>
          <Bubble align="end">
            <BubbleContent>By default, yes. You can change it per request.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}

export function Product() {
  return (
    <MessageGroup className="mx-auto w-full max-w-lg">
      <Message>
        <MessageAvatar>S</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Support <time dateTime="2026-10-24T09:41">9:41 AM</time>
          </MessageHeader>
          <Bubble variant="secondary">
            <BubbleContent>Thanks, that is with the team. Someone will reply here, usually within a few minutes.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>AL</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            You <time dateTime="2026-10-24T09:43">9:43 AM</time>
          </MessageHeader>
          <BubbleGroup>
            <Bubble align="end">
              <BubbleContent>The batch from this morning shows 3 failed URLs.</BubbleContent>
            </Bubble>
            <Bubble align="end">
              <BubbleContent>Can you check why?</BubbleContent>
            </Bubble>
          </BubbleGroup>
          <MessageFooter>
            <CheckCheck /> Seen
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}

export function Delivered() {
  return (
    <Message align="end" className="mx-auto max-w-lg">
      <MessageAvatar>AL</MessageAvatar>
      <MessageContent>
        <Bubble align="end">
          <BubbleContent>Upgrading to Growth now.</BubbleContent>
        </Bubble>
        <MessageFooter>
          <Check /> Delivered
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}
