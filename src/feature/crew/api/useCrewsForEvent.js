const gql = a => a[0];

export const GQL = gql`
  subscription crewsForEvent($objectId: [uuid!] = [""]) {
    crew {
      id
      name
      driver_user_id
      device_id
      abbreviation
      status
      user_settings {
        is_online
        id
        last_ping
      }
      permissions(where: {status: {_in: ALLOWED}, request: {is_assigned_while_in_breaks: {_eq: true}}, time_left: {_gte: "0"}}) {
        status
        request {
          duration
          value
        }
      }
      object_key_boxes(where: {keys: {object: {id: {_in: $objectId}}}}) {
        id
      }
    }
  }
`;
