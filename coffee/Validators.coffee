###
Validators are small classes that have a `validate` method. the validate method
  takes a single value. if the value is invalid throw a utils.ValidationError
###

if exports?
  utils = require "./utils"
else if window?
  utils = window.utils

class RegexValidator
  ###
  base regex validator.  
  Attributes:

    * `regex`
    * `message`
    * `code` defaults to "invalid"
  ###
  regex: ''
  message: utils._i('Enter a valid value.')
  code: 'invalid'
  constructor: (@regex=@regex, @message=@message, @code=@code) ->
    # Compile the regex if it was not passed pre-compiled.
    if typeof(@regex) == 'string'
      @regex = new RegExp(@regex)
      
  validate: (value) ->
    ###
    Validates that the input matches the regular expression.
    ###
    if not value.match(@regex)
      throw new utils.ValidationError(@message, @code)

# DJANGODIFF - Cannot ensure url exists
# DJANGODIFF - Cannot match IDN domains
class URLValidator extends RegexValidator
  regex: /^(?:http|ftp)s?:\/\/(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i
  message: utils._i('Enter a valid URL.')
  
class IntegerValidator
  validate: (value) ->
    if isNaN(parseInt(value))
      throw new utils.ValidationError('','')
      
# DJANGODIFF - Cannot match IDN domains
class EmailValidator extends RegexValidator
  regex: /(^[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-\011\013\014\016-\177])*")@((?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?$)|\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]$/i
  message: utils._i('Enter a valid e-mail address.')
  
class SlugValidator extends RegexValidator
  regex: /^[-\w]+$/
  message: utils._i("Enter a valid 'slug' consisting of letters, numbers, underscores or hyphens.")
  
class IPv4AddressValidator extends RegexValidator
  regex: /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/
  message: utils._i('Enter a valid IPv4 address.')

class IPv6AddressValidator
  error: new utils.ValidationError(utils._i('Enter a valid IPv6 address.'), 'invalid')
  
  validate: (value) ->
    # We need to have at least one ':'.
    if ':' not in value
      throw @error

    # We can only have one '::' shortener.
    if value.match(/::/g).length > 1
      throw @error

    # '::' should be encompassed by start, digits or end.
    if ':::' in value
      throw @error

    # A single colon can neither start nor end an address.
    if (value.match('^:')? or value.match(':$')?)
      throw @error

    # We can never have more than 7 ':' (1::2:3:4:5:6:7:8 is invalid)
    if value.match(/:/g).length > 7
      throw @error

    # If we have no concatenation, we need to have 8 fields with 7 ':'.
    if '::' not in value and value.match(/:/g).length != 7
      # We might have an IPv4 mapped address.
      if value.match(/\./g).length != 3
        throw @error

    value = _explode_shorthand_ip_string(value)

    # Now that we have that all squared away, let's check that each of the
    # hextets are between 0x0 and 0xFFFF.
    for hextet in value.split(':')
      if hextet.match(/\./g).length == 3
        # If we have an IPv4 mapped address, the IPv4 portion has to
        # be at the end of the IPv6 portion.
        v = value.split(':')
        if not v[v.length-1] == hextet
          throw @error
        try
          new IPv4AddressValidator().validate(hextet)
        catch e
          throw @error
      else
        try
          # a value error here means that we got a bad hextet,
          # something like 0xzzzz
          if parseInt(hextet, 16) < 0x0 or parseInt(hextet, 16) > 0xFFFF
            throw @error
        catch e
          throw @error

class IPv46AddressValidator
  validate: (value) ->
    try
      new IPv4AddressValidator().validate(value)
    catch e
      try
        new IPv6AddressValidator().validate(value)
      catch e
        throw utils.ValidationError(utils._i('Enter a valid IPv4 or IPv6 address.'), 'invalid')

ip_address_validator_map = 
  { both: [[IPv46AddressValidator], utils._i('Enter a valid IPv4 or IPv6 address.')]
  , ipv4: [[IPv4AddressValidator], utils._i('Enter a valid IPv4 address.')]
  , ipv6: [[IPv6AddressValidator], utils._i('Enter a valid IPv6 address.')]
  }

ip_address_validators = (protocol, unpack_ipv4) ->
  ###
  Depending on the given parameters returns the appropriate validators for
  the GenericIPAddressField.

  This code is here, because it is exactly the same for the model and the form field.
  ###
  if protocol != 'both' and unpack_ipv4
    raise ValueError(
      "You can only use `unpack_ipv4` if `protocol` is set to 'both'")
  try
    return ip_address_validator_map[protocol.lower()]
  catch e
    raise ValueError(utils.interpolate("The protocol '%s' is unknown. Supported: 'both', 'ipv4', 'ipv6'", [protocol]))

class CommaSeparatedIntegerListValidator extends RegexValidator
  regex = /^[\d,]+$/
  error = utils._i('Enter only digits separated by commas.')
  
class BaseValidator
  compare: (a,b) -> return (a isnt b)
  clean: (x) -> return x
  message: utils._i("Ensure this value is %(limit_value)s (it is %(show_value)s).")
  code: 'limit_value'
  
  constructor: (@limit_value) ->
  
  validate: (value) ->
    cleaned = @clean(value)
    params = {limit_value:@limit_value, show_value:cleaned}
    if (@compare(cleaned, @limit_value))
      throw utils.ValidationError( utils.interpolate(@message, params), @code, params )

class MaxValueValidator extends BaseValidator
  compare: (a,b) -> return (a > b)
  message: utils._i('Ensure this value is less than or equal to %(limit_value)s.')
  code: 'max_value'
  
class MinValueValidator extends BaseValidator
  compare: (a, b) -> return (a < b)
  message: utils._i('Ensure this value is greater than or equal to %(limit_value)s.')
  code: 'min_value'

class MinLengthValidator extends BaseValidator
  x: 53
  compare: (a, b) -> return (a < b)
  clean: (x) -> return x.length
  message: utils._i('Ensure this value has at least %(limit_value)d characters (it has %(show_value)d).')
  code: 'min_length'

class MaxLengthValidator extends BaseValidator
  compare: (a, b) -> return (a > b)
  clean: (x) -> x.length
  message: utils._i('Ensure this value has at most %(limit_value)d characters (it has %(show_value)d).')
  code: 'max_length'

class MaxDecimalPlacesValidator extends BaseValidator
  compare: (a, b) -> return (a > b)
  clean: (x) -> String(x.split(".")[1] || "").length
  message: utils._i('Ensure this value has at most %(limit_value)d digits after the decimal.')

class MinDecimalPlacesValidator extends BaseValidator
  compare: (a, b) -> return (a < b)
  clean: (x) -> String(x.split(".")[1] || "").length
  message: utils._i('Ensure this value has at least %(limit_value)d digits after the decimal.')

class MaxDigitsValidator extends BaseValidator
  compare: (a, b) -> return (a > b)
  clean: (x) -> String(x).replace('.','').length
  message: utils._i('Ensure this value has at most %(limit_value)d digits.')

isEmpty = (val) ->
  emptyValues = [null, undefined, '']
  if val in emptyValues
    return true
  else return false

validators = 
  RegexValidator: RegexValidator
  URLValidator: URLValidator
  IntegerValidator: IntegerValidator
  EmailValidator: EmailValidator
  SlugValidator: SlugValidator
  IPv4AddressValidator: IPv4AddressValidator
  IPv6AddressValidator: IPv6AddressValidator
  IPv46AddressValidator: IPv46AddressValidator
  ip_address_validators: ip_address_validators
  CommaSeparatedIntegerListValidator: CommaSeparatedIntegerListValidator
  BaseValidator: BaseValidator
  MaxValueValidator: MaxValueValidator
  MinValueValidator: MinValueValidator
  MinLengthValidator: MinLengthValidator
  MaxLengthValidator: MaxLengthValidator
  isEmpty: isEmpty
  
if window?
  window.validators = validators
else if exports?
  module.exports = validators
  








  





_explode_shorthand_ip_string = (ip_str) ->
  ###
  Expand a shortened IPv6 address.

  Args:
      ip_str: A string, the IPv6 address.

  Returns:
      A string, the expanded IPv6 address.

  ###
  if not utils._is_shorthand_ip(ip_str)
      # We've already got a longhand ip_str.
      return ip_str

  newutils._ip = []
  hextet = ip_str.split('::')

  # If there is a ::, we need to expand it with zeroes
  # to get to 8 hextets - unless there is a dot in the last hextet,
  # meaning we're doing v4-mapping
  if '.' in ip_str.split(':')[-1]
      fill_to = 7
  else
      fill_to = 8

  if len(hextet) > 1
      sep = len(hextet[0].split(':')) + len(hextet[1].split(':'))
      newutils._ip = hextet[0].split(':')

      for _ in xrange(fill_to - sep)
          newutils._ip.push('0000')
      newutils._ip += hextet[1].split(':')

  else
      newutils._ip = ip_str.split(':')

  # Now need to make sure every hextet is 4 lower case characters.
  # If a hextet is < 4 characters, we've got missing leading 0's.
  retutils._ip = []
  for hextet in newutils._ip
      retutils._ip.push(('0' * (4 - len(hextet)) + hextet).lower())
  return ':'.join(retutils._ip)

utils._is_shorthand_ip = (ip_str) ->
    ###Determine if the address is shortened.

    Args:
        ip_str: A string, the IPv6 address.

    Returns:
        A boolean, True if the address is shortened.

    ###
    if ip_str.match(/::/g).length == 1
        return true
    if _.any(ip_str.split(':'), (x) -> x.length < 4)
        return true
    return false
